import { Router } from "express";
import Visita from "../models/Visita.js";
import Activo from "../models/Activo.js";
import { requiereSesion, requiereAdmin } from "../middleware/sesion.js";
import { limite } from "../middleware/limite.js";

const router = Router();
const ID = /^[\w-]{1,40}$/;
const DISPOSITIVOS = ["Escritorio", "Móvil", "Tablet"];
const CONECTADO_MS = 45 * 1000;

const esId = v => typeof v === "string" && ID.test(v);
const esPagina = v => typeof v === "string" && v.length > 0 && v.length <= 60;
const disp = v => (DISPOSITIVOS.includes(v) ? v : "Escritorio");
const invalido = res => res.status(400).json({ ok: false, error: "Datos inválidos." });

/* ===== Públicas: también cuentan quienes no han iniciado sesión.
   El nombre de la persona sale de la sesión, no de lo que envíe el navegador. ===== */
router.post("/", limite(60 * 1000, 60), async (req, res) => {
    const { vid, sid, pagina } = req.body || {};
    if (!esId(vid) || !esId(sid) || !esPagina(pagina)) return invalido(res);
    await Visita.create({ vid, sid, pagina, disp: disp(req.body.disp), usuario: req.usuario?.nombre ?? null });
    res.status(201).json({ ok: true });
});

router.post("/latido", limite(60 * 1000, 120), async (req, res) => {
    const { sid, pagina } = req.body || {};
    if (!esId(sid) || !esPagina(pagina)) return invalido(res);
    await Activo.updateOne(
        { sid },
        { $set: { pagina, disp: disp(req.body.disp), usuario: req.usuario?.nombre ?? null, fecha: new Date() } },
        { upsert: true }
    );
    res.json({ ok: true });
});

/* Es POST porque el navegador lo envía con sendBeacon al cerrar la página */
router.post("/quitar-activo", limite(60 * 1000, 120), async (req, res) => {
    const { sid } = req.body || {};
    if (!esId(sid)) return invalido(res);
    await Activo.deleteOne({ sid });
    res.json({ ok: true });
});

/* ===== Solo administrador ===== */
router.get("/", requiereSesion, requiereAdmin, async (req, res) => {
    const visitas = await Visita.find().sort({ fecha: -1 }).limit(3000).lean();
    res.json({ ok: true, visitas: visitas.reverse() });
});

router.get("/conectados", requiereSesion, requiereAdmin, async (req, res) => {
    const conectados = await Activo.find({ fecha: { $gte: new Date(Date.now() - CONECTADO_MS) } }).sort({ fecha: -1 }).lean();
    res.json({ ok: true, conectados });
});

router.delete("/", requiereSesion, requiereAdmin, async (req, res) => {
    await Promise.all([Visita.deleteMany({}), Activo.deleteMany({})]);
    res.json({ ok: true });
});

export default router;
