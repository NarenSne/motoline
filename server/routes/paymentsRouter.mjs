import express from "express";
import { getWompiCheckout, wompiWebhook } from "../controllers/paymentsController.mjs";

const router = express.Router();

router.get("/wompi/:orderId/checkout", getWompiCheckout);
router.post("/wompi/webhook", wompiWebhook);

export default router;
