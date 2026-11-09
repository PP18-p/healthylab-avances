/* Revisa los datos de una receta antes de guardarla.
   Devuelve { datos } con los valores limpios, o { error } con un mensaje para el usuario. */
const CATEGORIAS = ["desayuno", "almuerzo", "cena"];

const texto = (v, max) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
const entero = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const numero = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
// Solo rutas dentro del sitio, como resources/imgs/avena.jpg (sin "http:" ni "..")
const esImagen = v => v === "" || (/^[\w\-./]{1,200}$/.test(v) && !v.includes(".."));

export function validarReceta(b) {
    if (!b || typeof b !== "object") return { error: "Datos inválidos." };
    const n = b.nutricion || {};
    const imagen = typeof b.imagen === "string" ? b.imagen.trim() : "";

    if (!texto(b.titulo, 80)) return { error: "El título debe tener entre 1 y 80 caracteres." };
    if (!CATEGORIAS.includes(b.categoria)) return { error: "Elige una categoría: desayuno, almuerzo o cena." };
    if (!esImagen(imagen)) return { error: "La ruta de la imagen no es válida. Ejemplo: resources/imgs/avena.jpg" };
    if (!entero(b.porciones, 1, 20)) return { error: "Las porciones deben ser un número entero entre 1 y 20." };
    if (!entero(b.minutos, 1, 600)) return { error: "Los minutos deben ser un número entero entre 1 y 600." };
    if (!["calorias", "proteinas", "carbohidratos", "grasas"].every(k => numero(n[k], 0, 5000)))
        return { error: "Revisa la información nutricional: son números entre 0 y 5000." };

    if (!Array.isArray(b.ingredientes) || b.ingredientes.length < 1 || b.ingredientes.length > 40)
        return { error: "Agrega entre 1 y 40 ingredientes." };
    const ingOk = i => i && texto(i.nombre, 100) && numero(i.cantidad, 0, 100000) &&
        (i.unidad === undefined || (typeof i.unidad === "string" && i.unidad.length <= 30));
    if (!b.ingredientes.every(ingOk)) return { error: "Cada ingrediente necesita un nombre y una cantidad (número)." };

    if (!Array.isArray(b.pasos) || b.pasos.length < 1 || b.pasos.length > 30)
        return { error: "Agrega entre 1 y 30 pasos." };
    const pasoOk = p => p && texto(p.texto, 300) && (p.minutos === undefined || entero(p.minutos, 0, 600));
    if (!b.pasos.every(pasoOk)) return { error: "Cada paso necesita un texto, y los minutos deben ser un número entero." };

    return {
        datos: {
            titulo: b.titulo.trim(),
            categoria: b.categoria,
            imagen,
            porciones: b.porciones,
            minutos: b.minutos,
            nutricion: { calorias: n.calorias, proteinas: n.proteinas, carbohidratos: n.carbohidratos, grasas: n.grasas },
            ingredientes: b.ingredientes.map(i => ({ nombre: i.nombre.trim(), cantidad: i.cantidad, unidad: (i.unidad || "").trim() })),
            pasos: b.pasos.map(p => ({ texto: p.texto.trim(), minutos: p.minutos || 0 })),
        },
    };
}