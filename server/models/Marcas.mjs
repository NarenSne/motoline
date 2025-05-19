import mongoose from "mongoose";

const MarcaSchema = new mongoose.Schema({
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