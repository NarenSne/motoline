import mongoose from "mongoose";
import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";
import sendEmail from "../utils/email.mjs";

export const createNormalInvoice = async (req, res) => {
  // Debugging: log headers and raw body if body-parsing fails on client side
  console.log('Invoice request headers:', req.headers);
  if (req.rawBody !== undefined) console.log('Invoice raw body:', req.rawBody);
  const {
    customerName,
    customerId,
    customerEmail,
    customerCedula,
    items,
    discount = 0,
    total,
    totalWithDiscount,
    isElectronic = false,
    paymentMethod,
    timestamp,
  } = req.body || {};
  console.log("Creating normal invoice with data:", req.body);
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invoice must include items" });
  }


  try {
    // For each item, check stock and decrement
    for (const it of items) {
      const productId = it.productId;
      const qty = Number(it.quantity) || 0;

      if (!productId || qty <= 0) {
        throw new Error("Invalid item productId or quantity");
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // decrement stock
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: -qty } }
      );
    }

    // Create order/invoice document
    const invoiceDoc = await Order.create(
      {
        customerName,
        customerId,
        customerEmail,
        customerCedula,
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.subtotal,
        })),
        discount,
        total,
        totalWithDiscount,
        isElectronic,
        paymentMethod,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        date: timestamp ? new Date(timestamp) : Date.now(),
      });


    res.status(201).json({ message: "Invoice created", id: invoiceDoc._id });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: error.message || "Error creating invoice" });
  }
};


export const getInvoiceHistory = async (req, res) => {
  try {
    const { date } = req.query;
    // Default to today or parse provided date
    const queryDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await Order.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      paymentMethod: { $exists: true, $ne: null }
    }).sort({ date: -1 });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoice history:", error);
    res.status(500).json({ error: "Error fetching invoice history" });
  }
};

export const sendElectronicInvoice = async (req, res) => {
  const {
    customerName,
    customerId,
    customerEmail,
    customerCelular,
    items,
    discount = 0,
    total,
    totalWithDiscount,
    isElectronic,
    paymentMethod,
    timestamp,
  } = req.body;
  let mailContador = "";
  console.log("Sending electronic invoice email to:", customerEmail);


  try {
    const formattedDate = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

    let itemsHtml = items.map(item =>
      `- ${item.productName} (x${item.quantity}): $${Number(item.subtotal).toFixed(2)}`
    ).join('\n');

    const message = `
      Hola,

      Aquí está el detalle de tu factura electrónica generada por la aplicación Motoline:

      Fecha: ${formattedDate}
      Cliente: ${customerName}
      Cédula/RUC: ${customerId}
      Teléfono: ${customerCelular || 'N/A'}
      
      Detalle de compra:
      ${itemsHtml}

      --------------------------------
      Subtotal: $${Number(total).toFixed(2)}
      Descuento: ${discount}%
      Total a Pagar: $${Number(totalWithDiscount || total).toFixed(2)}
      Método de Pago: ${paymentMethod}

      
      Atentamente,
      El equipo de Motoline
    `;

    await sendEmail({
      email: mailContador,
      subject: "Factura Electrónica - Motoline",
      message: message,
    });

    res.status(200).json({ message: "Electronic invoice sent successfully" });
  } catch (error) {
    console.error("Error sending electronic invoice:", error);
    res.status(500).json({ error: "Failed to send electronic invoice email" });
  }
};

export default { createNormalInvoice, getInvoiceHistory, sendElectronicInvoice };
