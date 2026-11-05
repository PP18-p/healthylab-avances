import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { leerSesion } from "./middleware/sesion.js";
import authRoutes from "./routes/auth.js";
import cuentasRoutes from "./routes/cuentas.js";
import estadoRoutes from "./routes/estado.js";
import resenasRoutes from "./routes/resenas.js";
import visitasRoutes from "./routes/visitas.js";

if (!process.env.JWT_SECRET) {
    console.error("Falta JWT_SECRET en server/.env");
    process.exit(1);
}

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(leerSesion);

// Ruta de prueba
app.get("/api/salud", (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "conectada" : "desconectada" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cuentas", cuentasRoutes);
app.use("/api/estado", estadoRoutes);
app.use("/api/resenas", resenasRoutes);
app.use("/api/visitas", visitasRoutes);

// Cualquier otra ruta /api que no exista
app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Ruta no encontrada." }));

// Errores inesperados: no mostramos detalles internos al usuario
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, error: "Datos inválidos." });
    console.error(err);
    res.status(500).json({ ok: false, error: "Error del servidor. Intenta de nuevo." });
});

const PORT = process.env.PORT || 3000;

try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB Atlas");
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
} catch (err) {
    console.error("No se pudo conectar a MongoDB:", err.message);
    process.exit(1);
}