
import path from 'path';
import fs from 'fs';
import Product from "../models/Product.mjs";
import MarcaVehicular from '../models/MarcaVehicular.mjs';
import ReferenciaVehicular from '../models/ReferenciaVehicular.mjs';

/**
 * Get all products in the database paginated.
 */
export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page);// Get page number, default to 1
        const limit = parseInt(req.query.limit); // Get limit per page, default to 10

        let products;

        if (page && limit) {
            const skip = (page - 1) * limit; // Calculate documents to skip

            products = await Product.find({})
                .skip(skip)
                .limit(limit);
        } else {
            products = await Product.find({});
        }

        const totalProducts = await Product.countDocuments(); // Get total count of products

        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
}

/**
 * Create a new product.
 */
export const createProduct = async (req, res) => {
    const { name, desc, price, stock, category, brand, Marcavehicular, ReferenciaVehiculo } = req.body;

    try {
        const newProduct = new Product({ name, desc, price, stock, category, brand, Marcavehicular, ReferenciaVehiculo });
        const result = await newProduct.save();
        res.status(201).json({ message: 'Product Added Successfully', product: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
}

/**
 * Get a product by its ID.
 */
export const getProductById = async (req, res) => {
    const productId = req.params.id;
    console.log(productId)
    try {
        const product = await Product.findOne({ _id: productId });
        res.json(product);
    } catch (error) {
        res.status(404).json({ message: 'Product not found' });
    }

}

/**
 * Update a product.
 */
export const updateProduct = async (req, res) => {

    const productId = req.params.id;
    const updates = req.body;

    try {
        const result = await Product.updateOne({ _id: productId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }

}

/**
 * Delete a product.
 */
export const deleteProduct = async (req, res) => {

    const productId = req.params.id;
    try {
        // Delete product from database
        const result = await Product.deleteOne({ _id: productId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }

}

/**
 * Decrease Product Stock
 * @params Array of Object => [{id, quantity}]
 */

export const decreaseProductStock = async (req, res) => {
    try {
        const productsToUpdate = req.body.products;
        console.log(productsToUpdate);

        for (const product of productsToUpdate) {
            const existingProduct = await Product.findOne({ _id: product.id });

            if (!existingProduct) {
                console.log(`Product with ID ${product.id} not found.`);
                continue;
            }

            if (existingProduct.stock < product.quantity) {
                console.log(`Insufficient stock for product with ID ${product.id}.`);
                continue;
            }

            // Decrease the stock
            existingProduct.stock -= product.quantity;

            // Save the updated product
            await existingProduct.save();
            console.log(`Stock decreased for product with ID ${product.id}. New stock: ${existingProduct.stock}`);
        }

        return res.json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error decreasing product stock:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while updating stock' });
    }
}

/**
 * Get Products count by brand 
 * @result [{brand: brand-name, count: num of prods}]
 */


export const getProductCountByBrand = async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: "$brand",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    brand: "$_id",
                    count: 1,
                },
            },
        ]);

        console.log('result' + result);

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export async function uploadProductImage(req, res, next) {
    const images = req.files.images;
    const productId = req.body.productId;

    try {
        if (!productId) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Asegura que haya un array de imágenes en el producto
        if (!Array.isArray(product.images)) {
            product.images = [];
        }

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const fileName = `${Date.now()}-${file.originalname}`;
            const uploadPath = path.join('uploads', fileName);
            const fullPath = path.resolve(uploadPath);

            // Guarda la imagen en el disco
            fs.writeFileSync(fullPath, file.buffer);

            // Genera la URL pública (ajusta la base según tu dominio o IP)
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

            // Guarda la URL en el array del producto
            product.images.push(imageUrl);
        }

        await product.save();
        return res.status(200).json({ message: "Images uploaded successfully", images: product.images });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to upload images" });
    }
}


/**
 * Get all products in the database paginated.
 */
export const getAllMarcaVehicular = async (req, res) => {
    try {
        const page = parseInt(req.query.page);// Get page number, default to 1
        const limit = parseInt(req.query.limit); // Get limit per page, default to 10

        let marcaVehicular;

        if (page && limit) {
            const skip = (page - 1) * limit; // Calculate documents to skip

            marcaVehicular = await MarcaVehicular.find({})
                .skip(skip)
                .limit(limit);
        } else {
            marcaVehicular = await MarcaVehicular.find({});
        }

        const totalProducts = await MarcaVehicular.countDocuments(); // Get total count of products

        res.json({
            marcaVehicular,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
}

export const createMarcaVehicular = async (req, res) => {
    const { name } = req.body;

    try {
        const newProduct = new MarcaVehicular({ name });
        const result = await newProduct.save();
        res.status(201).json({ message: 'Marca vehicular añadida satisfactoriamente', product: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando marca vehicular' });
    }
}

export const updateMarcaVehicular = async (req, res) => {

    const productId = req.params.id;
    const updates = req.body;

    try {
        const result = await MarcaVehicular.updateOne({ _id: productId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }

}
/**
 * Get all products in the database paginated.
 */
export const getAllreferenciaVehicular = async (req, res) => {
    try {
        const page = parseInt(req.query.page);// Get page number, default to 1
        const limit = parseInt(req.query.limit); // Get limit per page, default to 10

        let referenciaVehicular;

        if (page && limit) {
            const skip = (page - 1) * limit; // Calculate documents to skip

            referenciaVehicular = await ReferenciaVehicular.find({})
                .skip(skip)
                .limit(limit);
        } else {
            referenciaVehicular = await ReferenciaVehicular.find({});
        }

        const totalProducts = await ReferenciaVehicular.countDocuments(); // Get total count of products

        res.json({
            referenciaVehicular,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
}

export const createreferenciaVehicular = async (req, res) => {
    const { marca , name } = req.body;

    try {
        const newProduct = new ReferenciaVehicular({ marca, name });
        const result = await newProduct.save();
        res.status(201).json({ message: 'Referencia vehicular añadida satisfactoriamente', product: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando referencia vehicular' });
    }
}
export const updatereferenciaVehicular = async (req, res) => {

    const productId = req.params.id;
    const updates = req.body;

    try {
        const result = await ReferenciaVehicular.updateOne({ _id: productId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', result: result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }

}