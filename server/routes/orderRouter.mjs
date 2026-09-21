import express from "express";
import {
  getAllOrders,
  getOrderById,
  addOrder,
  updateOrderToAccepted,
  updateOrderToRejected,
  deleteOrder,
  orderStatusReport,
  getBestSellingProducts,
} from "../controllers/ordersController.mjs";
import { restrictTo, protect, optionalAuth } from "../controllers/authController.mjs";

const router = express.Router();

router.get("/", protect, getAllOrders);
router.get("/:id", protect, getOrderById);
router.post("/", optionalAuth, addOrder);
router.put("/:id/accept", protect, restrictTo("admin"), updateOrderToAccepted);
router.put("/:id/reject", protect, restrictTo("admin"), updateOrderToRejected);
router.delete("/:id/cancel", protect, deleteOrder);
router.get("/reports/status", protect, restrictTo("admin"), orderStatusReport);
router.get("/reports/best-selling", getBestSellingProducts);

export default router;
