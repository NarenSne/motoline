import express from "express";
import { quoteShipping } from "../controllers/shippingController.mjs";

const router = express.Router();

router.post("/quote", quoteShipping);

export default router;
