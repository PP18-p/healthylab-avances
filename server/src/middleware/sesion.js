import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const COOKIE = "hl_token";

export const opcionesCookie = {
    httpOnly: true, // JavaScript del navegador no puede leerla
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // solo HTTPS cuando esté publicado
    path: "/",
};

// Revisa la cookie en cada petición; si es válida, deja el usuario en req.usuario
export async function leerSesion(req, res, next) {
    req.usuario = null;
    const token = req.cookies?.[COOKIE];
    if (!token) return next();
    try {
        const { id, exp } = jwt.verify(token, process.env.JWT_SECRET);
        const u = await Usuario.findById(id);
        if (u && u.estado === "activo") {
            req.usuario = u;
            req.sesionExp = exp * 1000;
        } else {
            res.clearCookie(COOKIE, opcionesCookie); // cuenta borrada o suspendida
        }
    } catch {
        res.clearCookie(COOKIE, opcionesCookie); // token vencido o alterado
    }
    next();
}

export function requiereSesion(req, res, next) {
    if (!req.usuario) return res.status(401).json({ ok: false, error: "Inicia sesión para continuar." });
    next();
}

export function requiereAdmin(req, res, next) {
    if (req.usuario?.rol !== "admin") return res.status(403).json({ ok: false, error: "Solo el administrador puede hacer esto." });
    next();
}