/* ===== ESTADO DE LA PÁGINA DE RECETAS =====
   Favoritos, lista de compras, plan semanal y valoraciones viven en el servidor.
   El texto ampliado es una preferencia de este dispositivo y sigue en el navegador. */
import { api } from "./api";
import { LS } from "./auth";

export const cargarEstado = () => api("/estado");

/* Los cambios se envían de uno en uno para que lleguen en el orden en que se hicieron */
let cola = Promise.resolve();
export function guardarEstado(cambios) {
    const envio = cola.then(() => api("/estado", { metodo: "PATCH", datos: cambios }));
    cola = envio;
    return envio;
}

/* ===== Valoraciones ===== */
export const cargarResenas = receta => api(`/resenas/${receta}`);
export const publicarResena = datos => api("/resenas", { metodo: "POST", datos });

/* ===== Texto ampliado (antes se guardaba dentro de la clave "hl") ===== */
export const leerGrande = () => !!LS.get("hl_grande", LS.get("hl", {})?.grande);
export const guardarGrande = valor => LS.set("hl_grande", valor);
