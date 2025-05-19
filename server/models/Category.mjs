import mongoose from "mongoose";

const CategoriaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nombre de la Categoria es requerido"], // Custom error message
        unique: true,
        trim: true, // Trim whitespace from beginning and end
    },image: {
        type: String// Custom error message
    }
}) 

// Create a model
const Categoria = mongoose.model("Categoria", CategoriaSchema);
export default Categoria;