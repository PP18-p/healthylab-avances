import mongoose from "mongoose";

const activoSchema = new mongoose.Schema({
    sid: { type: String, required: true, unique: true },
    pagina: { type: String, default: "" },
    disp: { type: String, default: "Escritorio" },
    usuario: { type: String, default: null },
    // Si no llega un "latido" en 2 minutos, MongoDB borra el registro
    fecha: { type: Date, default: Date.now, expires: 120 },
});

export default mongoose.model("Activo", activoSchema);