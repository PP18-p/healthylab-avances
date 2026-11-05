import { Router } from "express";
import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";
import Resena from "../models/Resena.js";
import { requiereSesion, requiereAdmin } from "../middleware/sesion.js";
import { claveTemporal, hashClave } from "../utils/claves.js";

// Administración de cuentas. Las nuevas se crean con POST /api/auth/registro.
const router = Router();
router.use(requiereSesion, requiereAdmin);

const publica = u => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    estado: u.estado,
    creado: u.createdAt.getTime(),
    ultimo: u.ultimo ? u.ultimo.getTime() : null,
    accesos: u.accesos,
});

// Solo cuentas normales: estas rutas nunca modifican al administrador
const buscar = id => (mongoose.isValidObjectId(id) ? Usuario.findOne({ _id: id, rol: "usuario" }) : null);
const noExiste = res => res.status(404).json({ ok: false, error: "La cuenta ya no existe." });

router.get("/", async (req, res) => {
    const cuentas = await Usuario.find({ rol: "usuario" }).sort({ createdAt: -1 });
    res.json({ ok: true, cuentas: cuentas.map(publica) });
});

/* Suspender o activar */
router.patch("/:id/estado", async (req, res) => {
    const u = await buscar(req.params.id);
    if (!u) return noExiste(res);
    u.estado = u.estado === "activo" ? "suspendido" : "activo";
    await u.save();
    res.json({ ok: true, estado: u.estado });
});

/* Contraseña temporal: se devuelve solo esta vez y la anterior deja de funcionar */
router.post("/:id/clave-temporal", async (req, res) => {
    const u = await buscar(req.params.id);
    if (!u) return noExiste(res);
    const clave = claveTemporal();
    u.hash = await hashClave(clave);
    await u.save();
    res.json({ ok: true, clave });
});

/* Eliminar: sus reseñas se conservan con el nombre, pero sin cuenta asociada */
router.delete("/:id", async (req, res) => {
    const u = await buscar(req.params.id);
    if (!u) return noExiste(res);
    await Resena.updateMany({ usuario: u._id }, { $set: { usuario: null } });
    await u.deleteOne();
    res.json({ ok: true });
});

export default router;
