import Marca from "../models/Marcas.mjs";


export const getAllMarcas = async (req, res) => {
    try {
        const page = parseInt(req.query.page);// Get page number, default to 1
        const limit = parseInt(req.query.limit); // Get limit per page, default to 10

        let marcas;

        if (page && limit) {
            const skip = (page - 1) * limit; // Calculate documents to skip

            marcas = await Marca.find({})
                .skip(skip)
                .limit(limit);
        } else {
            marcas = await Marca.find({});
        }

        const totalmarcas = await Marca.countDocuments(); // Get total count of products

        res.json({
            marcas,
            currentPage: page,
            totalPages: Math.ceil(totalmarcas / limit),
            totalmarcas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
}

export const createMarca = async (req, res) => {
    const { category,name } = req.body;

    try {
        const newMarca = new Marca({ category,name });
        const result = await newMarca.save();
        res.status(201).json({ message: 'Marca añadida satisfactoriamente', product: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando Marca' });
    }
}

export const updateMarca = async (req, res) => {

    const productId = req.params.id;
    const updates = req.body;

    try {
        const result = await Marca.updateOne({ _id: productId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: 'Marca sin cambios' });
        }
        res.json({ message: 'Marca Actualizada', result: result });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error actualizando marca' });
    }

}

export const deleteMarca = async (req, res) => {

    const productId = req.params.id;
    try {
        // Delete product from database
        const result = await Marca.deleteOne({ _id: productId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Marca eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error eliminando marca' });
    }

}