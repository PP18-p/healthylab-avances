import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { latido, nombrePagina, quitarActivo, registrarVisita } from "../services/visitas";

/* No pinta nada: cuenta la visita cada vez que cambia la ruta (el panel de admin no se cuenta). */
export default function Seguimiento() {
    const { pathname } = useLocation();
    const { sesion } = useAuth();
    const quien = sesion ? sesion.nombre : null; // al iniciar o cerrar sesión se envía un latido enseguida
    const pagina = nombrePagina(pathname);
    const ultima = useRef("");

    useEffect(() => {
        if (pagina === "admin.html" || ultima.current === pagina) return;
        ultima.current = pagina;
        registrarVisita(pagina);
    }, [pagina]);

    useEffect(() => {
        if (pagina === "admin.html") return;
        latido(pagina);
        const t = setInterval(() => latido(pagina), 15000);
        return () => clearInterval(t);
    }, [pagina, quien]);

    useEffect(() => {
        addEventListener("pagehide", quitarActivo);
        return () => removeEventListener("pagehide", quitarActivo);
    }, []);

    return null;
}
