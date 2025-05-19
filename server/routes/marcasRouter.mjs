import express from "express";
import { protect } from "../controllers/authController.mjs";
import { createMarca, deleteMarca, getAllMarcas, updateMarca } from "../controllers/marcasController.mjs";

const router = express.Router();

router.get('/',getAllMarcas);
router.post("/", protect, createMarca);
router.put("/:id", protect, updateMarca);
router.delete("/:id", protect, deleteMarca);

export default router;