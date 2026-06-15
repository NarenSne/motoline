import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nombre del color es requerido"],
        unique: true,
        trim: true,
    }
});

const Color = mongoose.model("Color", ColorSchema);
export default Color;
