import User from "../models/User.mjs";
import Product from "../models/Product.mjs";
import {
  getCartId,
  getCartItems,
  addCartItem,
  removeCartItem,
} from "../utils/guestCart.mjs";

/**
 * Cuenta las ocurrencias totales de productos en un carrito (array de {productId,quantity})
 * @returns Map<string, number> donde la clave es productId y el valor la suma de quantities
 */
export function countProductOccurrences(cart) {
  const productCountMap = new Map();
  cart.forEach(({ productId, quantity }) => {
    const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
    productCountMap.set(
      productId,
      (productCountMap.get(productId) || 0) + qty
    );
  });
  return productCountMap;
}


/**
 * Agrega un producto al carrito (sesión o BD de usuario)
 */
export async function addCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: "Quantity must be a positive integer." });
    }

    // — Carrito anónimo —
    if (!req.user) {
      const cartId = getCartId(req);
      if (!cartId) {
        return res.status(400).json({ error: "Cart ID is required." });
      }

      await addCartItem(cartId, String(productId), qty);

      return res.status(200).json({
        message: "Product added to anonymous cart.",
        cart: await getCartItems(cartId)
      });
    }

    // — Carrito de usuario autenticado —
    const user = await User.findById(req.user._id);
    user.carts = user.carts || [];
    const existing = user.carts.find(item => item.productId.toString() === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      user.carts.push({ productId, quantity: qty });
    }
    await user.save();

    return res.status(200).json({
      message: "Product added to user cart.",
      cart: user.carts
    });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}


/**
 * Obtiene los detalles del carrito (sesión o BD de usuario)
 */
export async function getCart(req, res, next) {
  try {
    let items;

    if (!req.user) {
      // — Carrito anónimo —
      const cartId = getCartId(req);
      items = cartId ? await getCartItems(cartId) : [];
    } else {
      // — Carrito autenticado —
      const user = await User.findById(req.user._id);
      items = user.carts || [];
    }

    // Obtenemos los productos desde la BD
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Montamos la respuesta
    const data = items
      .map(({ productId, quantity }) => {
        const p = products.find(x => x._id.toString() === productId);
        return p ? {
          _id:     p._id,
          name:    p.name,
          price:   p.price,
          desc:    p.desc,
          stock:   p.stock,
          image:   p.images[0],
          quantity
        } : null;
      })
      .filter(Boolean);

    return res.status(200).json({
      message: "Cart retrieved successfully.",
      data
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}


/**
 * Elimina o decrementa un producto del carrito
 */
export async function deleteCart(req, res, next) {
  try {
    const { productId, type } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    // — Anónimo —
    if (!req.user) {
      const cartId = getCartId(req);
      if (!cartId) {
        return res.status(400).json({ error: "Cart ID is required." });
      }

      const removed = await removeCartItem(cartId, String(productId), type === "removeAll");
      if (!removed) {
        return res.status(404).json({ error: "Product not found in cart." });
      }

      return res.status(200).json({
        message: "Product removed from anonymous cart.",
        cart: await getCartItems(cartId)
      });
    }

    // — Autenticado —
    const user = await User.findById(req.user._id);
    user.carts = user.carts || [];

    const idx = user.carts.findIndex(item => item.productId.toString() === productId);
    if (idx === -1) {
      return res.status(404).json({ error: "Product not found in cart." });
    }

    if (type === "removeAll" || user.carts[idx].quantity <= 1) {
      user.carts.splice(idx, 1);
    } else {
      user.carts[idx].quantity -= 1;
    }

    await user.save();

    return res.status(200).json({
      message: "Product removed from user cart.",
      cart: user.carts
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}


/**
 * Obtiene el tamaño total (suma de quantities) del carrito
 */
export async function getCartSize(req, res, next) {
  try {
    let cart = [];

    if (!req.user) {
      const cartId = getCartId(req);
      cart = cartId ? await getCartItems(cartId) : [];
    } else {
      const user = await User.findById(req.user._id);
      cart = user.carts || [];
    }

    const map = countProductOccurrences(cart);
    const totalItems = [...map.values()].reduce((sum, v) => sum + v, 0);

    return res.status(200).json({
      message: "Cart size retrieved",
      data: totalItems
    });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}



export async function uploadImage(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized: User not found",
    });
  }
  const image = req.files.image;
  try {
    if (!image) {
      return res.status(400).send("No file uploaded");
    }
    const base64String = image[0].buffer.toString("base64");
    console.log(base64String);
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    user.image = base64String;
    await user.save();
    return res.status(200).json({ message: "image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}



