import { Router } from "express";
import Usuario from "../models/Usuario.js";
import { requiereSesion } from "../middleware/sesion.js";
import { validarEstado } from "../utils/validarEstado.js";

// Favoritos, lista de compras y plan semanal de la cuenta con sesión
const router = Router();
router.use(requiereSesion);

router.get("/", (req, res) => {
    const { favs, lista, plan } = req.usuario;
    res.json({ ok: true, estado: { favs, lista, plan } });
});

router.patch("/", async (req, res) => {
    const cambios = validarEstado(req.body);
    if (!cambios) return res.status(400).json({ ok: false, error: "Datos inválidos." });
    // Solo se escriben los campos recibidos, sin pisar los demás
    if (Object.keys(cambios).length) await Usuario.updateOne({ _id: req.usuario._id }, { $set: cambios });
    res.json({ ok: true });
});

export default router;
