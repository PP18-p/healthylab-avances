/* Funciones de cálculo y formato que usa el panel de administración */

export const DIA = 864e5;

export const fFecha = t => t ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(t) : "Nunca";
export const fDia = t => new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric" }).format(t);

export const hace = t => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    return s < 60 ? `hace ${s} s` : s < 3600 ? `hace ${Math.floor(s / 60)} min` : s < 86400 ? `hace ${Math.floor(s / 3600)} h` : `hace ${Math.floor(s / 86400)} d`;
};

export const inicioDia = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

/* Nombres para mostrar de las páginas registradas en el historial (intro.html es el nombre antiguo de hlp.html) */
const PAGS = { "index.html": "Inicio", "hlp.html": "Recetas", "intro.html": "Recetas", "login.html": "Ingreso y registro", "admin.html": "Panel de administración" };
export const nombrePag = p => PAGS[p] || p;

export const unicos = a => new Set(a.map(e => e.v)).size;
export const sesiones = a => new Set(a.map(e => e.s)).size;

/* Cuenta cuántas veces aparece cada valor: [{ n: nombre, v: cantidad }] de mayor a menor */
export function contar(a, f) {
    const m = {};
    a.forEach(e => { const k = f(e); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
}

export const promedio = l => l.reduce((a, x) => a + x.e, 0) / l.length;
export const dec = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
export const estrellasTxt = n => "★".repeat(n) + "☆".repeat(5 - n);

/* Descarga un archivo de texto desde el navegador */
export function descargar(nombre, texto, tipo) {
    const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
    const a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
