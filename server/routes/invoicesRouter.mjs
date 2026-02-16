import express from "express";
import { createNormalInvoice, getInvoiceHistory, sendElectronicInvoice } from "../controllers/invoicesController.mjs";

const router = express.Router();

router.post("/normal", createNormalInvoice);
router.get("/history", getInvoiceHistory);
router.post("/electronic", sendElectronicInvoice);

export default router;
