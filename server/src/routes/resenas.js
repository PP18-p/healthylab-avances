import { Router } from "express";
import mongoose from "mongoose";
import Resena from "../models/Resena.js";
import { requiereSesion, requiereAdmin } from "../middleware/sesion.js";
import { limite } from "../middleware/limite.js";

const router = Router();
router.use(requiereSesion); // las recetas y sus reseñas solo se ven con sesión

const publica = r => ({ id: r.id, receta: r.receta, n: r.nombre, e: r.estrellas, t: r.texto, f: r.createdAt.getTime() });
const esReceta = n => Number.isInteger(n) && n >= 0 && n < 1000;

/* Todas las reseñas (panel de administración). Va antes de /:receta */
router.get("/todas", requiereAdmin, async (req, res) => {
    const resenas = await Resena.find().sort({ createdAt: 1 });
    res.json({ ok: true, resenas: resenas.map(publica) });
});

/* Reseñas de una receta */
router.get("/:receta", async (req, res) => {
    const receta = Number(req.params.receta);
    if (!esReceta(receta)) return res.status(400).json({ ok: false, error: "Receta inválida." });
    const resenas = await Resena.find({ receta }).sort({ createdAt: 1 });
    res.json({ ok: true, resenas: resenas.map(publica) });
});

/* Publicar: el nombre sale de la cuenta, nunca de lo que envíe el navegador */
router.post("/", limite(60 * 1000, 10), async (req, res) => {
    const { receta, estrellas } = req.body || {};
    const texto = String(req.body?.texto || "").trim();
    if (!esReceta(receta)) return res.status(400).json({ ok: false, error: "Receta inválida." });
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return res.status(400).json({ ok: false, error: "Elige de 1 a 5 estrellas." });
    if (texto.length < 5 || texto.length > 300) return res.status(400).json({ ok: false, error: "El comentario debe tener entre 5 y 300 caracteres." });

    const r = await Resena.create({ receta, usuario: req.usuario._id, nombre: req.usuario.nombre, estrellas, texto });
    res.status(201).json({ ok: true, resena: publica(r) });
});

/* Eliminar (solo administrador) */
router.delete("/:id", requiereAdmin, async (req, res) => {
    const r = mongoose.isValidObjectId(req.params.id) ? await Resena.findByIdAndDelete(req.params.id) : null;
    if (!r) return res.status(404).json({ ok: false, error: "El comentario ya no existe." });
    res.json({ ok: true });
});

export default router;
