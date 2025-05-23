import Order from "../models/Order.mjs";
import Product from "../models/Product.mjs";

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("user", {
      username: 1,
      email: 1,
      fullName: 1,
      phone: 1,
      gender: 1,
      address: 1,
      role: 1,
      image: 1,
      _id: 1,
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const productsCount = order.products.reduce((acc, productId) => {
      acc[productId] = (acc[productId] || 0) + 1;
      return acc;
    }, {});

    const productIds = Object.keys(productsCount);
    const productsDetails = await Product.find({ _id: { $in: productIds } });

    const products = productIds.map((productId) => {
      const productDetail = productsDetails.find(
        (product) => product._id.toString() === productId.toString()
      );
      const count = productsCount[productId];
      return {
        _id: productId,
        name: productDetail ? productDetail.name : "Product not found",
        price: productDetail ? productDetail.price : 0,
        desc: productDetail ? productDetail.desc : "No description available",
        images: productDetail ? productDetail.images : [],
        stock: productDetail ? productDetail.stock : 0,
        count: count,
      };
    });

    res.json({ order, products });
  } catch (error) {
    console.error("Error while fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = req.user.role === "admin" ? {} : { user: req.user._id };

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate("user", {
          username: 1,
          email: 1,
          fullName: 1,
          phone: 1,
          gender: 1,
          address: 1,
          role: 1,
          image: 1,
          _id: 1,
        })
        .skip(startIndex)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    const ordersWithUniqueProductIds = orders.map((order) => {
      const uniqueProductIds = [...new Set(order.products)]; // Get unique product IDs

      return {
        ...order.toObject(),
        uniqueProductIds,
      };
    });

    // Get unique product IDs from all orders
    const allUniqueProductIds = [
      ...new Set(
        ordersWithUniqueProductIds.flatMap((order) => order.uniqueProductIds)
      ),
    ];

    // Fetch and populate unique products
    const uniqueProducts = await Product.find(
      {
        _id: { $in: allUniqueProductIds },
      },
      {
        name: 1,
        price: 1,
        desc: 1,
        stock: 1,
      }
    );

    // Map unique products to each order
    const ordersWithPopulatedProducts = ordersWithUniqueProductIds.map(
      (order) => {
        const populatedProducts = order.uniqueProductIds.map((productId) =>
          uniqueProducts.find((product) => product._id.equals(productId))
        );

        return {
          ...order,
          uniqueProducts: populatedProducts,
        };
      }
    );
    const totalPages = Math.ceil(totalOrders / limit);

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalOrders: totalOrders,
    };

    res.json({ orders: ordersWithPopulatedProducts, pagination });
  } catch (error) {
    console.error("Error while fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addOrder = async (req, res) => {
  const { products, totalPrice, address } = req.body;

  if (!products || Object.keys(products).length === 0) {
    res.status(400).json({
      error: "No products in the order, please add products to the order",
    });
    return;
  }

  const processedProducts = Object.entries(products).flatMap(
    ([productId, quantity]) => {
      return Array.from({ length: quantity }, () => productId);
    }
  );

  const bulkOps = processedProducts.map((productId) => ({
    updateOne: {
      filter: { _id: productId, stock: { $gt: 0 } },
      update: { $inc: { stock: -1 } },
    },
  }));

  await Product.bulkWrite(bulkOps);

  try {
    const createdOrder = await Order.create({
      products: processedProducts,
      totalPrice,
      address,
      user: req.user._id,
      date: Date.now(),
    });

    req.user.carts = [];
    req.user.orders.push(createdOrder._id);
    await req.user.save();

    res.json({ message: createdOrder.id });
  } catch (error) {
    console.error("Error while creating the order:", error);
    res.status(500).json({ error: "Error while creating the order" });
  }
};

const updateOrderStatus = async (req, res, newStatus) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = newStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(`Error while updating order to ${newStatus}:`, error);
    res
      .status(500)
      .json({ error: `Error while updating order to ${newStatus}` });
  }
};

export const updateOrderToAccepted = async (req, res) => {
  await updateOrderStatus(req, res, "accepted");
};

export const updateOrderToRejected = async (req, res) => {
  await updateOrderStatus(req, res, "rejected");
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("Error while deleting order:", error);
    res.status(500).json({ error: "Error while deleting order" });
  }
};

export const orderStatusReport = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const orderStatuses = ["accepted", "rejected", "pending"];
    const missingStatuses = orderStatuses.filter(
      (status) => !orders.some((order) => order.status === status)
    );

    const nonExistingStatuses = missingStatuses.map((status) => ({
      status: status,
      count: 0,
    }));

    const report = [...orders, ...nonExistingStatuses];

    res.json(report);
  } catch (error) {
    console.error("Error while fetching order status report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
