import { Router } from "express";
import Receta from "../models/Receta.js";
import { requiereSesion, requiereAdmin } from "../middleware/sesion.js";
import { validarReceta } from "../utils/validarReceta.js";

const router = Router();
router.use(requiereSesion); // las recetas solo se ven con sesión

// Lo que se envía al navegador: el cliente sigue usando "id" como antes
const publica = r => ({
    id: r.numero, titulo: r.titulo, categoria: r.categoria, imagen: r.imagen,
    porciones: r.porciones, minutos: r.minutos, nutricion: r.nutricion,
    ingredientes: r.ingredientes, pasos: r.pasos,
});
const leerNumero = v => { const n = Number(v); return Number.isInteger(n) && n >= 0 ? n : null; };
const CAMPOS = "-_id numero titulo categoria imagen porciones minutos nutricion ingredientes pasos";

/* Todas las recetas visibles */
router.get("/", async (req, res) => {
    const recetas = await Receta.find({ borrada: false }, CAMPOS).sort({ numero: 1 }).lean();
    res.json({ ok: true, recetas: recetas.map(publica) });
});

/* Crear (solo administrador). El número nuevo es el mayor que exista + 1, contando las borradas */
router.post("/", requiereAdmin, async (req, res) => {
    const { datos, error } = validarReceta(req.body);
    if (error) return res.status(400).json({ ok: false, error });
    const ultima = await Receta.findOne({}, "numero").sort({ numero: -1 }).lean();
    try {
        const r = await Receta.create({ ...datos, numero: ultima ? ultima.numero + 1 : 0 });
        res.status(201).json({ ok: true, receta: publica(r) });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ ok: false, error: "Se creó otra receta al mismo tiempo. Intenta de nuevo." });
        throw err;
    }
});

/* Editar (solo administrador) */
router.put("/:id", requiereAdmin, async (req, res) => {
    const numero = leerNumero(req.params.id);
    if (numero === null) return res.status(400).json({ ok: false, error: "Receta inválida." });
    const { datos, error } = validarReceta(req.body);
    if (error) return res.status(400).json({ ok: false, error });
    const r = await Receta.findOneAndUpdate({ numero, borrada: false }, datos, { returnDocument: "after" }).lean();
    if (!r) return res.status(404).json({ ok: false, error: "La receta ya no existe." });
    res.json({ ok: true, receta: publica(r) });
});

/* Eliminar (solo administrador): se oculta para no romper reseñas, favoritos ni planes */
router.delete("/:id", requiereAdmin, async (req, res) => {
    const numero = leerNumero(req.params.id);
    if (numero === null) return res.status(400).json({ ok: false, error: "Receta inválida." });
    const r = await Receta.updateOne({ numero, borrada: false }, { borrada: true });
    if (!r.matchedCount) return res.status(404).json({ ok: false, error: "La receta ya no existe." });
    res.json({ ok: true });
});

export default router;