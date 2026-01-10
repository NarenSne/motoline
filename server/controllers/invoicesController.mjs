import mongoose from "mongoose";
import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";

export const createNormalInvoice = async (req, res) => {
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
    timestamp,
  } = req.body;
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

      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (typeof product.stock === "number" && product.stock < qty) {
        throw new Error(
          `Insufficient stock for product ${productId}: available ${product.stock}, required ${qty}`
        );
      }

      // decrement stock
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: -qty } },
        { session }
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
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        date: timestamp ? new Date(timestamp) : Date.now(),
      });


    res.status(201).json({ message: "Invoice created", id: invoiceDoc._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: error.message || "Error creating invoice" });
  }
};

export default { createNormalInvoice };
