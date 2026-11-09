import mongoose from "mongoose";

const ingredienteSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true },
        cantidad: { type: Number, required: true, min: 0 },
        unidad: { type: String, default: "", trim: true },
    },
    { _id: false }
);

const pasoSchema = new mongoose.Schema(
    {
        texto: { type: String, required: true, trim: true },
        minutos: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const recetaSchema = new mongoose.Schema(
    {
        // Número de la receta (0, 1, 2...). Lo usan las reseñas, los favoritos y el plan semanal
        numero: { type: Number, required: true, unique: true, min: 0 },
        titulo: { type: String, required: true, trim: true },
        categoria: { type: String, required: true, enum: ["desayuno", "almuerzo", "cena"] },
        imagen: { type: String, default: "", trim: true },
        porciones: { type: Number, required: true, min: 1 },
        minutos: { type: Number, required: true, min: 1 },
        nutricion: {
            calorias: { type: Number, required: true, min: 0 },
            proteinas: { type: Number, required: true, min: 0 },
            carbohidratos: { type: Number, required: true, min: 0 },
            grasas: { type: Number, required: true, min: 0 },
        },
        ingredientes: { type: [ingredienteSchema], default: [] },
        pasos: { type: [pasoSchema], default: [] },
        // Al eliminar una receta solo se oculta: así su número nunca se reutiliza
        borrada: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Receta", recetaSchema);