import { useEffect, useState } from "react";

/* Carga datos de la API y los vuelve a pedir cuando cambia «version».
   Si una actualización falla, se conservan los últimos datos. «cargar» debe ser una función estable. */
export function useDatos(cargar, version) {
    const [estado, setEstado] = useState({ datos: null, error: "" });

    useEffect(() => {
        let vivo = true;
        cargar().then(r => {
            if (!vivo) return;
            setEstado(e => (r.ok ? { datos: r.datos, error: "" } : { ...e, error: r.error }));
        });
        return () => { vivo = false; };
    }, [cargar, version]);

    return estado;
}
