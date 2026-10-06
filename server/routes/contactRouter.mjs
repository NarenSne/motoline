import express from "express";
import { sendContactMessage } from "../controllers/contactController.mjs";
import { rateLimit } from "../utils/rateLimit.mjs";

const router = express.Router();

router.post("/", rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }), sendContactMessage);

export default router;
