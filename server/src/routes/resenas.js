import { Router } from "express";
import rateLimit from "express-rate-limit";
import Resena from "../models/Resena.js";
import { requiereSesion } from "../middleware/sesion.js";

const router = Router();

// Mismo formato que usaba localStorage: n = nombre, e = estrellas, t = texto, f = fecha
const formato = r => ({ id: r.id, n: r.nombre, e: r.estrellas, t: r.texto, f: r.createdAt.getTime() });

function idReceta(req, res) {
    const n = Number(req.params.receta);
    if (!Number.isInteger(n) || n < 0 || n >= 1000) {
        res.status(400).json({ ok: false, error: "Receta no válida." });
        return null;
    }
    return n;
}

/* ===== Leer las reseñas de una receta ===== */
router.get("/:receta", async (req, res) => {
    const receta = idReceta(req, res);
    if (receta === null) return;
    const ultimas = await Resena.find({ receta }).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, resenas: ultimas.reverse().map(formato) }); // de la más antigua a la más nueva
});

// Máximo 10 reseñas cada 10 minutos, para evitar spam
const limitePublicar = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    handler: (req, res) => res.status(429).json({ ok: false, error: "Publicaste muchas valoraciones seguidas. Espera unos minutos." }),
});

/* ===== Publicar una reseña ===== */
router.post("/:receta", requiereSesion, limitePublicar, async (req, res) => {
    const receta = idReceta(req, res);
    if (receta === null) return;
    const e = Number(req.body?.e);
    const t = String(req.body?.t ?? "").trim();
    if (!Number.isInteger(e) || e < 1 || e > 5) return res.status(400).json({ ok: false, error: "Elige de 1 a 5 estrellas." });
    if (t.length < 5) return res.status(400).json({ ok: false, error: "Escribe un comentario de al menos 5 caracteres." });
    if (t.length > 300) return res.status(400).json({ ok: false, error: "El comentario puede tener máximo 300 caracteres." });

    const r = await Resena.create({
        receta,
        usuario: req.usuario._id,
        nombre: req.usuario.nombre, // el nombre sale de la cuenta, no de un campo libre
        estrellas: e,
        texto: t,
    });
    res.status(201).json({ ok: true, resena: formato(r) });
});

export default router;