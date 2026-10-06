import GuestCart from "../models/GuestCart.mjs";

const CART_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export const getCartId = (req) => {
  const id = req.get("x-cart-id");
  return id && CART_ID_PATTERN.test(id) ? id : null;
};

export const getCartItems = async (cartId) => {
  const cart = await GuestCart.findOne({ cartId });
  if (!cart) return [];

  const merged = new Map();
  cart.items.forEach(({ productId, quantity }) => {
    merged.set(productId, (merged.get(productId) || 0) + quantity);
  });
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
};

export const addCartItem = async (cartId, productId, quantity) => {
  const now = new Date();
  const incremented = await GuestCart.updateOne(
    { cartId, "items.productId": productId },
    { $inc: { "items.$.quantity": quantity }, $set: { updatedAt: now } }
  );
  if (!incremented.matchedCount) {
    await GuestCart.updateOne(
      { cartId },
      { $push: { items: { productId, quantity } }, $set: { updatedAt: now } },
      { upsert: true }
    );
  }
};

export const removeCartItem = async (cartId, productId, removeAll) => {
  const items = await getCartItems(cartId);
  const item = items.find((i) => i.productId === productId);
  if (!item) return false;

  const now = new Date();
  if (removeAll || item.quantity <= 1) {
    await GuestCart.updateOne(
      { cartId },
      { $pull: { items: { productId } }, $set: { updatedAt: now } }
    );
  } else {
    await GuestCart.updateOne(
      { cartId, "items.productId": productId },
      { $inc: { "items.$.quantity": -1 }, $set: { updatedAt: now } }
    );
  }
  return true;
};

export const clearCart = async (cartId) => {
  await GuestCart.deleteOne({ cartId });
};
