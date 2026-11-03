import { useEffect, useState } from "react";

/* Modo claro/oscuro. Usa la misma clave "tema" de localStorage que el sitio anterior. */
function leerTema() {
    try {
        const t = localStorage.getItem("tema");
        if (t === "oscuro" || t === "claro") return t;
    } catch { /* sin almacenamiento */ }
    return matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export function useTema() {
    const [tema, setTema] = useState(leerTema);

    useEffect(() => {
        document.documentElement.dataset.tema = tema;
    }, [tema]);

    function alternar() {
        const nuevo = tema === "oscuro" ? "claro" : "oscuro";
        setTema(nuevo);
        try { localStorage.setItem("tema", nuevo); } catch { /* sin almacenamiento */ }
    }

    return [tema, alternar];
}
