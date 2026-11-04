/* ===== SERVICIO DEL PANEL DE ADMINISTRACIÓN =====
   Hoy lee y escribe en localStorage (mismas claves del sitio anterior).
   En la fase B solo cambia el interior de estas funciones por llamadas a la API. */
import { LS, bytes, guardarUsuarios, rnd, sha256, usuarios } from "./auth";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const claveTemporal = () => [...bytes(12)].map(b => ALFABETO[b % ALFABETO.length]).join("");

/* ===== Visitas ===== */
export const leerVisitas = () => LS.get("hl_visitas", []);
export const leerConectados = () => Object.entries(LS.get("hl_activos", {}))
    .filter(([, v]) => v.t > Date.now() - 45000)
    .map(([sid, v]) => ({ sid, ...v }))
    .sort((a, b) => b.t - a.t);
export function reiniciarEstadisticas() { LS.del("hl_visitas"); LS.del("hl_activos"); }

/* ===== Cuentas ===== */
export const leerCuentas = () => usuarios().slice().sort((a, b) => b.creado - a.creado);

export function alternarEstado(id) {
    const lista = usuarios(), u = lista.find(x => x.id === id);
    if (!u) return null;
    u.estado = u.estado === "activo" ? "suspendido" : "activo";
    guardarUsuarios(lista);
    return u.estado;
}

/* Genera una contraseña temporal; la anterior deja de funcionar. Devuelve la clave o null. */
export function restablecerClave(id) {
    const lista = usuarios(), u = lista.find(x => x.id === id);
    if (!u) return null;
    const t = claveTemporal();
    u.sal = rnd(12);
    u.hash = sha256(u.sal + t);
    guardarUsuarios(lista);
    return t;
}

export const eliminarCuenta = id => guardarUsuarios(usuarios().filter(x => x.id !== id));

/* ===== Valoraciones (las guarda la página de recetas en "hl" -> resenas[idReceta] = [{n, e, t, f}]) ===== */
export function leerResenas() {
    const r = (LS.get("hl", {}) || {}).resenas;
    return r && typeof r === "object" ? r : {};
}

/* Elimina un comentario; devuelve false si ya no existe */
export function eliminarResena(idReceta, indice) {
    const hl = LS.get("hl", {}) || {};
    if (!hl.resenas || !Array.isArray(hl.resenas[idReceta]) || !hl.resenas[idReceta][indice]) return false;
    hl.resenas[idReceta].splice(indice, 1);
    LS.set("hl", hl);
    return true;
}

/* ===== Respaldo (cuentas sin contraseñas + visitas) ===== */
export const crearRespaldo = () => ({
    fecha: new Date().toISOString(),
    cuentas: usuarios().map(({ sal, hash, ...resto }) => resto), // eslint-disable-line no-unused-vars
    visitas: leerVisitas()
});
