import mongoose from "mongoose";

const MarcaSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, "Nombre de la categoria es requerido"], // Custom error message
        trim: true, // Trim whitespace from beginning and end
    },
    name: {
        type: String,
        required: [true, "Nombre de la marca es requerido"], // Custom error message
        unique: true,
        trim: true, // Trim whitespace from beginning and end
    },
}) 

// Create a model
const Marca = mongoose.model("Marca", MarcaSchema);
export default Marca;