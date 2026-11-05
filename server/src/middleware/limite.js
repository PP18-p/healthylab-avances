import rateLimit from "express-rate-limit";

// Limita cuántas peticiones puede hacer una misma IP en un periodo de tiempo
export const limite = (ms, maximo, opciones = {}) =>
    rateLimit({
        windowMs: ms,
        limit: maximo,
        handler: (req, res) => res.status(429).json({ ok: false, error: "Demasiados intentos. Espera un momento." }),
        ...opciones,
    });
