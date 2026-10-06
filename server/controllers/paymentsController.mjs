import crypto from "crypto";
import Order from "../models/Order.mjs";
import { notifyOrder } from "../services/orderEmails.mjs";

const CURRENCY = "COP";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

const getAmountInCents = (order) => {
  const total = (order.totalPrice || 0) + (order.shippingCost || 0);
  return Math.round(total * 100);
};

const getByPath = (object, path) =>
  path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), object);

export const getWompiCheckout = async (req, res) => {
  const { WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_SECRET } = process.env;
  if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET) {
    console.error("Wompi no está configurado: faltan WOMPI_PUBLIC_KEY / WOMPI_INTEGRITY_SECRET");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ error: "Order is not pending payment" });
    }

    const reference = order.id;
    const amountInCents = getAmountInCents(order);
    const integrity = sha256(`${reference}${amountInCents}${CURRENCY}${WOMPI_INTEGRITY_SECRET}`);

    res.json({
      publicKey: WOMPI_PUBLIC_KEY,
      currency: CURRENCY,
      reference,
      amountInCents,
      signature: { integrity },
    });
  } catch (error) {
    console.error("Error while preparing Wompi checkout:", error);
    res.status(500).json({ error: "Error while preparing the payment" });
  }
};

const isValidWompiEvent = (body, eventsSecret) => {
  const checksum = body?.signature?.checksum;
  const properties = body?.signature?.properties;
  if (!checksum || !Array.isArray(properties) || body.timestamp === undefined) {
    return false;
  }

  const values = properties.map((property) => getByPath(body.data, property));
  if (values.some((value) => value === undefined)) {
    return false;
  }

  const expected = sha256(`${values.join("")}${body.timestamp}${eventsSecret}`);
  const received = String(checksum).toLowerCase();
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
};

export const wompiWebhook = async (req, res) => {
  const { WOMPI_EVENTS_SECRET } = process.env;
  if (!WOMPI_EVENTS_SECRET) {
    console.error("Wompi no está configurado: falta WOMPI_EVENTS_SECRET");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  if (!isValidWompiEvent(req.body, WOMPI_EVENTS_SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  try {
    if (req.body.event === "transaction.updated") {
      const transaction = req.body.data.transaction;
      const order = await Order.findById(transaction.reference);

      if (order && order.status === "pending") {
        if (
          transaction.status === "APPROVED" &&
          transaction.amount_in_cents === getAmountInCents(order)
        ) {
          order.status = "accepted";
          await order.save();
          notifyOrder("confirmed", order);
        } else if (["DECLINED", "VOIDED", "ERROR"].includes(transaction.status)) {
          order.status = "rejected";
          await order.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error while processing Wompi event:", error);
    res.status(500).json({ error: "Error while processing the event" });
  }
};
