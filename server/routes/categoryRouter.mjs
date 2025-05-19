import express from "express";
import { protect } from "../controllers/authController.mjs";
import { createCategory, deleteCategory, getAllCategory, updateCategory, uploadCategoryImage } from "../controllers/categoryController.mjs";
import multer from "multer";
const uploadStructure = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});
const router = express.Router();

router.get('/',getAllCategory);
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

router.patch(
    "/updateImage",
    protect,
    uploadStructure.fields({ name: "image"}),
    uploadCategoryImage
);
export default router;