/* ===== ESTADO DE LA PÁGINA DE RECETAS =====
   Favoritos, lista de compras, plan semanal, valoraciones y texto ampliado.
   Se guarda en localStorage bajo la clave "hl", igual que el sitio anterior; el panel de
   administración lee de ahí las valoraciones (resenas). En la fase B pasará a la API. */
import { LS } from "./auth";

const BASE = { favs: [], lista: [], plan: {}, resenas: {}, grande: false };

export const leerEstado = () => ({ ...BASE, ...(LS.get("hl", {}) || {}) });

/* Guarda solo lo que cambió, sin pisar el resto del objeto */
export function guardarEstado(cambios) {
    const nuevo = { ...leerEstado(), ...cambios };
    LS.set("hl", nuevo);
    return nuevo;
}
