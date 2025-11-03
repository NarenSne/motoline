import express from "express";
import { getAllProducts, createProduct, getProductById, updateProduct, deleteProduct, decreaseProductStock, getProductCountByBrand, uploadProductImage, getAllMarcaVehicular, createMarcaVehicular, getAllreferenciaVehicular, createreferenciaVehicular, updateMarcaVehicular, updatereferenciaVehicular } from '../controllers/productController.mjs';
import multer from "multer";
import { protect } from "../controllers/authController.mjs";
import { getBestSellingProducts } from "../controllers/ordersController.mjs";

const router = express.Router();

const uploadStructure = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

router.get("/", getAllProducts);
router.post("/", protect, createProduct);
router.get('/product-counts-by-brand', getProductCountByBrand);
router.get("/marcaVehicular",getAllMarcaVehicular);
router.post("/marcaVehicular", protect,createMarcaVehicular);
router.put("/marcaVehicular/:id", protect,updateMarcaVehicular);
router.get("/referenciaVehicular",getAllreferenciaVehicular);
router.post("/referenciaVehicular", protect,createreferenciaVehicular);
router.put("/referenciaVehicular/:id", protect,updatereferenciaVehicular);
router.get("/best-selling", getBestSellingProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/decrease-stock", decreaseProductStock);



router.patch(
    "/updateImage",
    protect,
    uploadStructure.fields([{ name: "images", maxCount: 5 }]),
    uploadProductImage
);

export default router;