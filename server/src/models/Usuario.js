import mongoose from "mongoose";

// Un ingrediente de la lista de compras
const itemListaSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true },
        cant: { type: Number, default: 0 },
        uni: { type: String, default: "" },
        ok: { type: Boolean, default: false },
    },
    { _id: false }
);

const usuarioSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
        correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
        hash: { type: String, required: true, select: false }, // nunca sale en las consultas normales
        rol: { type: String, enum: ["usuario", "admin"], default: "usuario" },
        estado: { type: String, enum: ["activo", "suspendido"], default: "activo" },
        ultimo: { type: Date, default: null },
        accesos: { type: Number, default: 0 },
        favs: { type: [Number], default: [] },
        lista: { type: [itemListaSchema], default: [] },
        plan: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "0-1": "4", ... }
    },
    { timestamps: true, minimize: false } // timestamps crea createdAt y updatedAt
);

export default mongoose.model("Usuario", usuarioSchema);