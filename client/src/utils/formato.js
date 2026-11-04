/* Texto sin tildes y en minúsculas, para buscar sin importar acentos */
export const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Número con coma decimal: 1.5 -> "1,5" */
export const num = n => String(Math.round(n * 10) / 10).replace(".", ",");

/* "300 g de pechuga de pollo", "2 dientes de ajo", "2 tomate" */
export function fmtIng(i, cantidad = i.cantidad) {
    const plural = cantidad > 1 && /^(diente|hoja|tallo)$/.test(i.unidad);
    const uni = i.unidad ? (plural ? i.unidad + "s" : i.unidad) + " de " : "";
    return `${num(cantidad)} ${uni}${i.nombre}`;
}
