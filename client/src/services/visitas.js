/* ===== RASTREO DE VISITAS =====
   Se envían al servidor, que toma el nombre de la persona de la sesión.
   El identificador del navegador (hl_vid) y el de la pestaña (hl_sid) siguen guardándose aquí. */
import { api } from "./api";
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

function vid() {
    let v = LS.get("hl_vid", null);
    if (!v) { v = rnd(10); LS.set("hl_vid", v); }
    return v;
}

export function registrarVisita(pagina) {
    return api("/visitas", { metodo: "POST", datos: { vid: vid(), sid: sid(), pagina, disp: dispositivo() } });
}

/* Marca a la persona como «conectada ahora» */
export function latido(pagina) {
    return api("/visitas/latido", { metodo: "POST", datos: { sid: sid(), pagina, disp: dispositivo() } });
}

/* sendBeacon entrega el aviso aunque la página se esté cerrando */
export function quitarActivo() {
    const datos = new Blob([JSON.stringify({ sid: sid() })], { type: "application/json" });
    navigator.sendBeacon("/api/visitas/quitar-activo", datos);
}
