import { Router } from "express";
import { requiereSesion } from "../middleware/sesion.js";

const router = Router();
router.use(requiereSesion); // todas estas rutas necesitan sesión

const esId = v => Number.isInteger(v) && v >= 0 && v < 1000;

// Cada función devuelve el valor limpio, o null si los datos no son válidos
function limpiarFavs(v) {
    if (!Array.isArray(v) || v.length > 200) return null;
    const ids = v.map(Number);
    if (!ids.every(esId)) return null;
    return [...new Set(ids)]; // sin repetidos
}

function limpiarLista(v) {
    if (!Array.isArray(v) || v.length > 300) return null;
    const out = [];
    for (const x of v) {
        const nombre = String(x?.nombre ?? "").trim().slice(0, 80);
        const cant = Number(x?.cant);
        if (!nombre || !Number.isFinite(cant) || cant < 0) return null;
        out.push({ nombre, cant, uni: String(x?.uni ?? "").slice(0, 20), ok: Boolean(x?.ok) });
    }
    return out;
}

function limpiarPlan(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const out = {};
    for (const [k, id] of Object.entries(v)) {
        // clave "día-comida": día 0 a 6, comida 0 a 2
        if (!/^[0-6]-[0-2]$/.test(k) || id === "" || id === null || !esId(Number(id))) return null;
        out[k] = String(Number(id));
    }
    return out;
}

const LIMPIADORES = { favs: limpiarFavs, lista: limpiarLista, plan: limpiarPlan };
const publico = u => ({ favs: u.favs, lista: u.lista, plan: u.plan || {} });

/* ===== Leer el estado de la cuenta ===== */
router.get("/", (req, res) => {
    res.json({ ok: true, estado: publico(req.usuario) });
});

/* ===== Guardar solo lo que cambió ===== */
router.patch("/", async (req, res) => {
    const b = req.body || {};
    const u = req.usuario;
    for (const campo of Object.keys(LIMPIADORES)) {
        if (b[campo] === undefined) continue;
        const valor = LIMPIADORES[campo](b[campo]);
        if (valor === null) return res.status(400).json({ ok: false, error: "Datos inválidos." });
        u[campo] = valor;
        if (campo === "plan") u.markModified("plan");
    }
    await u.save();
    res.json({ ok: true, estado: publico(u) });
});

export default router;
