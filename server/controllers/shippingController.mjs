import Product from "../models/Product.mjs";
import { getCartId, getCartItems } from "../utils/guestCart.mjs";
import { calculateShipping, isValidLocation } from "../services/shipping.mjs";

export const quoteShipping = async (req, res) => {
  const { department, city } = req.body;
  if (!isValidLocation(department, city)) {
    return res.status(400).json({ error: "Invalid destination" });
  }

  try {
    const cartId = getCartId(req);
    const items = cartId ? await getCartItems(cartId) : [];
    if (!items.length) {
      return res.status(400).json({ error: "The cart is empty" });
    }

    const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
    let units = 0;
    let declaredValue = 0;
    items.forEach(({ productId, quantity }) => {
      const product = products.find((p) => p._id.toString() === productId);
      if (product) {
        units += quantity;
        declaredValue += product.price * quantity;
      }
    });

    const { cost, zone, weightKg } = calculateShipping({ department, city, units, declaredValue });
    res.json({ cost, zone, weightKg });
  } catch (error) {
    console.error("Error while quoting shipping:", error);
    res.status(500).json({ error: "Error while quoting shipping" });
  }
};
