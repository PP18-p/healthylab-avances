/* ===== SERVICIO DE AUTENTICACIÓN (HealthyLab) =====
   La sesión vive en el servidor, en una cookie que JavaScript no puede leer.
   Las respuestas tienen la forma { ok, ... } o { ok: false, error }. */
import { api } from "./api";

export const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } }
};

export const bytes = n => {
    const a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < n; i++) a[i] = Math.random() * 256;
    return a;
};
export const rnd = n => [...bytes(Math.ceil(n / 2))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, n);
/* ===== CUENTAS ===== */
export const registrar = datos => api("/auth/registro", { metodo: "POST", datos });

/* ===== SESIÓN ===== */
export async function obtenerSesion() {
    const r = await api("/auth/sesion");
    return r.ok ? r.sesion : null;
}

/* true solo si el servidor confirma que no hay sesión; un fallo de red no cuenta */
export async function sesionVencida() {
    const r = await api("/auth/sesion");
    return r.ok && !r.sesion;
}

export const login = (id, pass) => api("/auth/login", { metodo: "POST", datos: { id, pass } });

export async function salir() { await api("/auth/salir", { metodo: "POST" }); }

export const cambiarClaveAdmin = (actual, nueva) => api("/auth/clave-admin", { metodo: "PUT", datos: { actual, nueva } });
