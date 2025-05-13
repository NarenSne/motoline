import mongoose from "mongoose";

const MarcaVehicularSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nombre de la marca vehicular es requerido"], // Custom error message
        unique: true,
        trim: true, // Trim whitespace from beginning and end
    },
}) 

// Create a model
const MarcaVehicular = mongoose.model("MarcaVehicular", MarcaVehicularSchema);
export default MarcaVehicular;