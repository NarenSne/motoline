import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  code:           { type: String, unique: true, required: true },
  type:           { type: String, enum: ['percentage', 'fixed'], required: true },
  value:          { type: Number, required: true },
  expiresAt:      { type: Date, required: true },
  maxUses:        { type: Number, default: 1 },
  usedCount:      { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 }
});

export const DiscountCode = mongoose.model('DiscountCode', discountSchema);
