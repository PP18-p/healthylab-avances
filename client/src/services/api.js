/* ===== LLAMADAS A LA API (servidor Express) =====
   Todas las respuestas tienen la forma { ok, ... } o { ok: false, error }. */

export async function api(ruta, { metodo = "GET", datos } = {}) {
    try {
        const r = await fetch("/api" + ruta, {
            method: metodo,
            headers: datos ? { "Content-Type": "application/json" } : undefined,
            body: datos ? JSON.stringify(datos) : undefined,
            credentials: "same-origin", // envía la cookie de sesión
        });
        return await r.json();
    } catch {
        return { ok: false, error: "No se pudo conectar con el servidor. Intenta de nuevo." };
    }
}