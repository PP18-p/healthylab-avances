/* ===== SERVICIO DE AUTENTICACIÓN (HealthyLab) =====
   La sesión vive en el servidor, en una cookie que JavaScript no puede leer.
   Las respuestas tienen la forma { ok, ... } o { ok: false, error }. */
import { api } from "./api";

export const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } }
};

/* SHA-256 en JavaScript puro (funciona también abriendo el archivo sin servidor) */
export function sha256(texto) {
    const rr = (v, a) => (v >>> a) | (v << (32 - a));
    const k = [], hash = [];
    let n = 0;
    for (let c = 2; n < 64; c++) {
        let primo = true;
        for (let d = 2; d * d <= c; d++) if (c % d === 0) { primo = false; break; }
        if (primo) {
            if (n < 8) hash[n] = (Math.pow(c, 0.5) * 4294967296) | 0;
            k[n++] = (Math.pow(c, 1 / 3) * 4294967296) | 0;
        }
    }
    let s = unescape(encodeURIComponent(texto));
    const bits = s.length * 8;
    s += "\x80";
    while (s.length % 64 - 56) s += "\x00";
    const words = [];
    for (let i = 0; i < s.length; i++) words[i >> 2] |= s.charCodeAt(i) << ((3 - i) % 4) * 8;
    words[words.length] = (bits / 4294967296) | 0;
    words[words.length] = bits;
    let h = hash;
    for (let j = 0; j < words.length;) {
        const w = words.slice(j, j += 16), old = h;
        h = h.slice(0, 8);
        for (let i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2], a = h[0], e = h[4];
            const t1 = h[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + k[i] +
                (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
            const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
            h = [(t1 + t2) | 0].concat(h);
            h[4] = (h[4] + t1) | 0;
        }
        for (let i = 0; i < 8; i++) h[i] = (h[i] + old[i]) | 0;
    }
    let out = "";
    for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) { const b = (h[i] >> (j * 8)) & 255; out += (b < 16 ? "0" : "") + b.toString(16); }
    return out;
}

export const bytes = n => {
    const a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < n; i++) a[i] = Math.random() * 256;
    return a;
};
export const rnd = n => [...bytes(Math.ceil(n / 2))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, n);
/* Solo para services/admin.js, hasta que el panel pase a la API */
export const usuarios = () => LS.get("hl_users", []);
export const guardarUsuarios = u => LS.set("hl_users", u);

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
