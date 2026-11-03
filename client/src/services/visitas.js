/* ===== RASTREO DE VISITAS =====
   Guarda en localStorage con las mismas claves que el sitio anterior (hl_visitas, hl_activos, hl_vid)
   para que el panel de administración lea los datos igual. */
import { LS, rnd } from "./auth";

/* Nombres de página que entiende el panel de admin (los del sitio anterior) */
const PAGINAS = { "/": "index.html", "/login": "login.html", "/recetas": "hlp.html", "/admin": "admin.html" };
export const nombrePagina = ruta => PAGINAS[ruta] || ruta;

let sidRespaldo;
function sid() {
    try {
        let s = sessionStorage.getItem("hl_sid");
        if (!s) { s = rnd(8); sessionStorage.setItem("hl_sid", s); }
        return s;
    } catch {
        sidRespaldo = sidRespaldo || rnd(8);
        return sidRespaldo;
    }
}

function dispositivo() {
    const ua = navigator.userAgent;
    return /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Móvil" : "Escritorio";
}

export function registrarVisita(pagina, quien) {
    let vid = LS.get("hl_vid", null);
    if (!vid) { vid = rnd(10); LS.set("hl_vid", vid); }
    const ev = LS.get("hl_visitas", []);
    ev.push({ t: Date.now(), v: vid, s: sid(), p: pagina, d: dispositivo(), u: quien });
    if (ev.length > 3000) ev.splice(0, ev.length - 3000);
    LS.set("hl_visitas", ev);
}

/* Marca a la persona como «conectada ahora» */
export function latido(pagina, quien) {
    const a = LS.get("hl_activos", {}), lim = Date.now() - 120000;
    for (const id in a) if (a[id].t < lim) delete a[id];
    a[sid()] = { t: Date.now(), p: pagina, d: dispositivo(), u: quien };
    LS.set("hl_activos", a);
}

export function quitarActivo() {
    const a = LS.get("hl_activos", {});
    delete a[sid()];
    LS.set("hl_activos", a);
}
