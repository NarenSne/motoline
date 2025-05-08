import User from "../models/User.mjs";

/**
 * this function is added product to cart for the current user
 *
 */
export async function addCart(req, res, next) {
  try {
    const productId = req.body.productId;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    if (!req.user) {
      // Usuario no autenticado: carrito anónimo
      if (!req.session.cart) {
        req.session.cart = [];
      }
      req.session.cart.push(productId);
      return res.status(200).json({ message: "Product added to anonymous cart." });
    }

    // Usuario autenticado
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    currentUser.carts.push(productId);
    await currentUser.save();
    res.status(200).json({ message: "Product added to user cart." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


/**
 * this function is get cart for the current user
 *
 */
import Product from "../models/Product.mjs"; // Necesario para buscar productos

export async function getCart(req, res, next) {
  try {
    let products = [];
    if (!req.user) {
      // Carrito anónimo
      const sessionCart = req.session.cart || [];
      const productDocs = await Product.find({ _id: { $in: sessionCart } });
      products = productDocs;
    } else {
      const userId = req.user._id;
      const currentUser = await User.findById(userId).populate("carts");
      products = currentUser.carts;
    }

    const productCountMap = countProductOccurrences(products);
    const productsArray = [];

    for (const [productId, count] of productCountMap.entries()) {
      const product = products.find((p) => p._id.toString() === productId);
      if (product) {
        productsArray.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          desc: product.desc,
          stock: product.stock,
          image: product.images[0],
          count,
        });
      }
    }
    
    res.status(200).json({
      message: "Cart retrieved successfully.",
      data: productsArray,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}


/**
 * this function is delete product from cart for the current user
 *
 */
export async function deleteCart(req, res, next) {
  try {
    const productId = req.body.productId;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    // Anónimo
    if (!req.user) {
      let sessionCart = req.session.cart || [];
      if (!sessionCart.includes(productId)) {
        return res.status(404).json({ error: "Product not found in cart." });
      }

      if (req.body.type === "removeAll") {
        req.session.cart = sessionCart.filter((id) => id !== productId);
      } else {
        const index = sessionCart.indexOf(productId);
        if (index !== -1) sessionCart.splice(index, 1);
        req.session.cart = sessionCart;
      }

      return res.status(200).json({ message: "Product removed from anonymous cart." });
    }

    // Autenticado
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    let userCart = currentUser.carts;

    if (req.body.type === "removeAll") {
      currentUser.carts = userCart.filter((id) => id.toString() !== productId);
    } else {
      const index = userCart.findIndex((id) => id.toString() === productId);
      if (index !== -1) currentUser.carts.splice(index, 1);
    }

    await currentUser.save();
    res.status(200).json({ message: "Product removed from user cart." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/**
 * this function is get size of cart for the current user
 *
 */
export async function getCartSize(req, res, next) {
  try {
    let cart = [];
    if (!req.user) {
      cart = req.session.cart || [];
    } else {
      const userId = req.user._id;
      const currentUser = await User.findById(userId);
      cart = currentUser.carts;
    }

    const products = countProductOccurrences(cart);
    res.status(200).json({
      message: "Cart size retrieved",
      data: products.size,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
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

/**
 * this function is calculate Occurrences of Products in cart
 * @result:{ 'productId': 'Occurrence'}
 */
export function countProductOccurrences(cart) {
  const productCountMap = new Map();
  cart.forEach((product) => {
    const productId = (typeof product === "object" && product._id)
      ? product._id.toString()
      : product.toString();
    productCountMap.set(productId, (productCountMap.get(productId) || 0) + 1);
  });
  return productCountMap;
}

