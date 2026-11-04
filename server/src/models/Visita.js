import mongoose from "mongoose";

const visitaSchema = new mongoose.Schema({
    // MongoDB borra cada visita automáticamente a los 90 días
    fecha: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
    vid: { type: String, required: true }, // identifica al navegador
    sid: { type: String, required: true }, // identifica la pestaña o sesión
    pagina: { type: String, required: true },
    disp: { type: String, default: "Escritorio" },
    usuario: { type: String, default: null },
});

export default mongoose.model("Visita", visitaSchema);