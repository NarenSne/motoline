import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Basic timestamps
  date: { type: Date, default: Date.now },

  // Optional user-based order (existing flows)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  address: {
    type: {
      street: { type: String },
      complement: { type: String },
      department: { type: String },
      city: { type: String },
      zip: { type: String },
    },
    required: false,
  },

  // Legacy products array used by some endpoints
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  totalPrice: { type: Number },
  shippingCost: { type: Number, default: 0 },
  trackingNumber: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  // Invoice-specific fields (for /api/invoices/normal)
  customerName: { type: String },
  customerFirstName: { type: String },
  customerLastName: { type: String },
  customerId: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  customerDocumentType: { type: String, enum: ["CC", "NIT"] },
  customerCedula: { type: String },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      subtotal: { type: Number },
    },
  ],
  discount: { type: Number, default: 0 },
  total: { type: Number },
  totalWithDiscount: { type: Number },
  isElectronic: { type: Boolean, default: false },
  timestamp: { type: Date },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
