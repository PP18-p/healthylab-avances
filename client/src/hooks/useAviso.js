import { useCallback, useEffect, useRef, useState } from "react";

/* Mensaje flotante que se oculta solo a los 3,5 segundos */
export function useAviso() {
    const [aviso, setAviso] = useState({ texto: "", visible: false });
    const temporizador = useRef(null);

    const mostrar = useCallback(texto => {
        clearTimeout(temporizador.current);
        setAviso({ texto, visible: true });
        temporizador.current = setTimeout(() => setAviso(a => ({ ...a, visible: false })), 3500);
    }, []);

    useEffect(() => () => clearTimeout(temporizador.current), []);

    return [aviso, mostrar];
}
