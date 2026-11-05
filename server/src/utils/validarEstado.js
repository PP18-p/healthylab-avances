/* Revisa favoritos, lista de compras y plan semanal antes de guardarlos.
   Devuelve solo los campos recibidos, o null si alguno no es válido. */
const esFav = v => Number.isInteger(v) && v >= 0 && v < 1000;

const esItem = x =>
    x && typeof x === "object" &&
    typeof x.nombre === "string" && x.nombre.trim().length > 0 && x.nombre.length <= 100 &&
    Number.isFinite(x.cant) && x.cant >= 0 &&
    (x.uni === undefined || (typeof x.uni === "string" && x.uni.length <= 30)) &&
    (x.ok === undefined || typeof x.ok === "boolean");

const esPlan = p =>
    p && typeof p === "object" && !Array.isArray(p) &&
    Object.keys(p).length <= 100 &&
    Object.entries(p).every(([k, v]) => /^\d{1,2}-\d{1,2}$/.test(k) && typeof v === "string" && /^\d{0,3}$/.test(v));

export function validarEstado(datos) {
    const cambios = {};
    if (datos?.favs !== undefined) {
        if (!Array.isArray(datos.favs) || datos.favs.length > 1000 || !datos.favs.every(esFav)) return null;
        cambios.favs = [...new Set(datos.favs)];
    }
    if (datos?.lista !== undefined) {
        if (!Array.isArray(datos.lista) || datos.lista.length > 300 || !datos.lista.every(esItem)) return null;
        cambios.lista = datos.lista.map(x => ({ nombre: x.nombre.trim(), cant: x.cant, uni: x.uni || "", ok: !!x.ok }));
    }
    if (datos?.plan !== undefined) {
        if (!esPlan(datos.plan)) return null;
        cambios.plan = datos.plan;
    }
    return cambios;
}
