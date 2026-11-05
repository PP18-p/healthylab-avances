/* ===== SERVICIO DEL PANEL DE ADMINISTRACIÓN =====
   Traduce las respuestas de la API al formato que usan el panel y sus estadísticas.
   Las funciones cargar... devuelven { ok, datos } o { ok: false, error }. */
import { api } from "./api";
import { bytes } from "./auth";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const claveTemporal = () => [...bytes(12)].map(b => ALFABETO[b % ALFABETO.length]).join("");

/* Junta varias cargas; si una falla, devuelve ese error */
async function juntar(cargas) {
    const nombres = Object.keys(cargas);
    const res = await Promise.all(Object.values(cargas).map(c => c()));
    const fallo = res.find(r => !r.ok);
    if (fallo) return fallo;
    return { ok: true, datos: Object.fromEntries(nombres.map((n, i) => [n, res[i].datos])) };
}

const leer = async (ruta, traducir) => {
    const r = await api(ruta);
    return r.ok ? { ok: true, datos: traducir(r) } : r;
};

/* ===== Visitas ===== */
export const cargarVisitas = () => leer("/visitas", r => r.visitas.map(v => ({
    t: new Date(v.fecha).getTime(), v: v.vid, s: v.sid, p: v.pagina, d: v.disp, u: v.usuario
})));

export const cargarConectados = () => leer("/visitas/conectados", r => r.conectados.map(a => ({
    sid: a.sid, t: new Date(a.fecha).getTime(), p: a.pagina, d: a.disp, u: a.usuario
})));

export const cargarTrafico = () => juntar({ visitas: cargarVisitas, conectados: cargarConectados });
export const cargarResumen = () => juntar({ visitas: cargarVisitas, conectados: cargarConectados, cuentas: cargarCuentas });

export const reiniciarEstadisticas = () => api("/visitas", { metodo: "DELETE" });

/* ===== Cuentas ===== */
export const cargarCuentas = () => leer("/cuentas", r => r.cuentas);
export const alternarEstado = id => api(`/cuentas/${id}/estado`, { metodo: "PATCH" });
/* Genera una contraseña temporal en el servidor; devuelve { ok, clave } */
export const restablecerClave = id => api(`/cuentas/${id}/clave-temporal`, { metodo: "POST" });
export const eliminarCuenta = id => api(`/cuentas/${id}`, { metodo: "DELETE" });

/* ===== Valoraciones: datos = { idReceta: [{ id, n, e, t, f }] } ===== */
export const cargarValoraciones = () => leer("/resenas/todas", r => {
    const porReceta = {};
    r.resenas.forEach(x => (porReceta[x.receta] = porReceta[x.receta] || []).push(x));
    return porReceta;
});
export const eliminarResena = id => api(`/resenas/${id}`, { metodo: "DELETE" });

/* ===== Respaldo (cuentas sin contraseñas + visitas) ===== */
export async function crearRespaldo() {
    const r = await juntar({ cuentas: cargarCuentas, visitas: cargarVisitas });
    return r.ok ? { ok: true, datos: { fecha: new Date().toISOString(), ...r.datos } } : r;
}
