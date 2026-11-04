import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// Ruta de prueba: dice si el servidor está vivo y si la base responde
app.get("/api/salud", (req, res) => {
    res.json({
        ok: true,
        db: mongoose.connection.readyState === 1 ? "conectada" : "desconectada",
    });
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