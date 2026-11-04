import mongoose from "mongoose";

const resenaSchema = new mongoose.Schema(
    {
        receta: { type: Number, required: true, min: 0, index: true }, // posición de la receta (0, 1, 2...)
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
        nombre: { type: String, required: true, trim: true }, // nombre de la cuenta al publicar
        estrellas: { type: Number, required: true, min: 1, max: 5 },
        texto: { type: String, required: true, trim: true, minlength: 5, maxlength: 300 },
    },
    { timestamps: true }
);

export default mongoose.model("Resena", resenaSchema);