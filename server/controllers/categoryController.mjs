import Category from "../models/Category.mjs";


export const getAllCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page);// Get page number, default to 1
        const limit = parseInt(req.query.limit); // Get limit per page, default to 10

        let categorias;

        if (page && limit) {
            const skip = (page - 1) * limit; // Calculate documents to skip

            categorias = await Category.find({})
                .skip(skip)
                .limit(limit);
        } else {
            categorias = await Category.find({});
        }

        const totalCategory = await Category.countDocuments(); // Get total count of products

        res.json({
            categorias,
            currentPage: page,
            totalPages: Math.ceil(totalCategory / limit),
            totalCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
}

export const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const newCategory = new Category({ name });
        const result = await newCategory.save();
        res.status(201).json({ message: 'Marca añadida satisfactoriamente', product: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando Marca' });
    }
}

export const updateCategory = async (req, res) => {

    const productId = req.params.id;
    const updates = req.body;

    try {
        const result = await Category.updateOne({ _id: productId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: 'categoria sin cambios' });
        }
        res.json({ message: 'categoria Actualizada', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando categoria' });
    }

}

export const deleteCategory = async (req, res) => {

    const productId = req.params.id;
    try {
        // Delete product from database
        const result = await Category.deleteOne({ _id: productId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Category eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error eliminando Category' });
    }

}

export async function uploadCategoryImage(req, res, next) {
    const images = req.files.images;
    const productId = req.body.productId;

    try {
        if (!productId) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = await Category.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const file = images[i];
        const fileName = `${Date.now()}-${file.originalname}`;
        const uploadPath = path.join('uploads', fileName);
        const fullPath = path.resolve(uploadPath);

        // Guarda la imagen en el disco
        fs.writeFileSync(fullPath, file.buffer);

        // Genera la URL pública (ajusta la base según tu dominio o IP)
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

            // Guarda la URL en el array del producto
        product.image = (imageUrl);

        await product.save();
        return res.status(200).json({ message: "Images uploaded successfully", images: product.images });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to upload images" });
    }
}