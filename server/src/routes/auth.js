import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Usuario from "../models/Usuario.js";
import { COOKIE, opcionesCookie, requiereSesion, requiereAdmin } from "../middleware/sesion.js";

const router = Router();
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DURACION = { admin: 2 * 3600e3, usuario: 7 * 864e5 }; // 2 horas y 7 días, como hoy

// Mismo formato de sesión que usa hoy el cliente
const sesionPublica = (u, exp) =>
    u.rol === "admin"
        ? { usuario: "admin", nombre: u.nombre, rol: "admin", exp }
        : { correo: u.correo, nombre: u.nombre, rol: "usuario", exp };

// Máximo 5 intentos fallidos por minuto
const limiteLogin = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    handler: (req, res) => res.status(429).json({ ok: false, error: "Demasiados intentos. Espera un minuto." }),
});

/* ===== Registro (no inicia sesión) ===== */
router.post("/registro", async (req, res) => {
    const nombre = String(req.body?.nombre || "").trim();
    const correo = String(req.body?.correo || "").trim().toLowerCase();
    const pass = String(req.body?.pass || "");
    if (nombre.length < 3) return res.status(400).json({ ok: false, error: "El nombre debe tener al menos 3 letras." });
    if (!CORREO.test(correo)) return res.status(400).json({ ok: false, error: "Ingresa un correo válido, por ejemplo nombre@correo.com." });
    if (pass.length < 8) return res.status(400).json({ ok: false, error: "La contraseña debe tener al menos 8 caracteres." });
    if (await Usuario.exists({ correo })) return res.status(409).json({ ok: false, error: "Ya existe una cuenta con ese correo." });

    const hash = await bcrypt.hash(pass, 12);
    const u = await Usuario.create({ nombre, correo, hash });
    res.status(201).json({ ok: true, usuario: { id: u.id, nombre: u.nombre, correo: u.correo } });
});

/* ===== Login ===== */
router.post("/login", limiteLogin, async (req, res) => {
    const id = String(req.body?.id || "").trim().toLowerCase();
    const pass = String(req.body?.pass || "");
    if (!id || !pass) return res.status(400).json({ ok: false, error: "Completa ambos campos." });

    const filtro = id === "admin" ? { rol: "admin" } : { correo: id };
    const u = await Usuario.findOne(filtro).select("+hash");
    if (!u || !(await bcrypt.compare(pass, u.hash)))
        return res.status(401).json({ ok: false, error: "Usuario o contraseña incorrectos." });
    if (u.estado !== "activo")
        return res.status(403).json({ ok: false, error: "Tu cuenta está suspendida. Contacta al administrador." });

    u.ultimo = new Date();
    u.accesos += 1;
    await u.save();

    const dur = DURACION[u.rol];
    const token = jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: dur / 1000 });
    res.cookie(COOKIE, token, { ...opcionesCookie, maxAge: dur });
    res.json({ ok: true, rol: u.rol, sesion: sesionPublica(u, Date.now() + dur) });
});

/* ===== Sesión actual ===== */
router.get("/sesion", (req, res) => {
    res.json({ ok: true, sesion: req.usuario ? sesionPublica(req.usuario, req.sesionExp) : null });
});

/* ===== Salir ===== */
router.post("/salir", (req, res) => {
    res.clearCookie(COOKIE, opcionesCookie);
    res.json({ ok: true });
});

/* ===== Cambiar clave del admin ===== */
router.put("/clave-admin", requiereSesion, requiereAdmin, async (req, res) => {
    const actual = String(req.body?.actual || "");
    const nueva = String(req.body?.nueva || "");
    const u = await Usuario.findById(req.usuario.id).select("+hash");
    if (!(await bcrypt.compare(actual, u.hash)))
        return res.status(400).json({ ok: false, error: "La contraseña actual no es correcta." });
    if (nueva.length < 10)
        return res.status(400).json({ ok: false, error: "La nueva contraseña debe tener al menos 10 caracteres." });
    u.hash = await bcrypt.hash(nueva, 12);
    await u.save();
    res.json({ ok: true });
});

export default router;