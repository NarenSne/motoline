import mongoose from "mongoose";

const guestCartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true },
  items: [
    {
      _id: false,
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

const GuestCart = mongoose.model("GuestCart", guestCartSchema);
export default GuestCart;
