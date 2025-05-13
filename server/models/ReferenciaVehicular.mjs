import mongoose from "mongoose";

const ReferenciaVehicularSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: [true, "Nombre de la marca vehicular es requerido"], // Custom error message
        unique: false,
        trim: true, // Trim whitespace from beginning and end
    },
    name: {
        type: String,
        required: [true, "Nombre de la referencia vehicular es requerido"], // Custom error message
        unique: true,
        trim: true, // Trim whitespace from beginning and end
    },
}) 

// Create a model
const ReferenciaVehicular = mongoose.model("ReferenciaVehicular", ReferenciaVehicularSchema);
export default ReferenciaVehicular;