import express from "express";
import { createNormalInvoice } from "../controllers/invoicesController.mjs";

const router = express.Router();

router.post("/normal", createNormalInvoice);

export default router;
