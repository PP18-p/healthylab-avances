/* Suma ingredientes a la lista de compras: si ya está (mismo nombre y unidad) suma la cantidad
   y lo desmarca; si no, lo agrega. Devuelve una lista nueva. Cada elemento: { nombre, uni, cant, ok } */
export function sumarALista(lista, items) {
    const nueva = lista.map(x => ({ ...x }));
    items.forEach(i => {
        const existe = nueva.find(x => x.nombre === i.nombre && x.uni === i.uni);
        if (existe) { existe.cant += i.cant; existe.ok = false; }
        else nueva.push({ nombre: i.nombre, uni: i.uni, cant: i.cant, ok: false });
    });
    return nueva;
}

export const pendientes = lista => lista.filter(x => !x.ok).length;

/* Ingredientes de una receta con el formato de la lista */
export const aItems = (ingredientes, factor = 1) =>
    ingredientes.map(i => ({ nombre: i.nombre, uni: i.unidad, cant: i.cantidad * factor }));
