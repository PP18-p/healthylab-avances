import { useEffect, useRef } from "react";
import Aviso from "../Aviso";

/* Ventana emergente del panel. El contenido es una función que recibe «cerrar». */
export default function Ventana({ onCerrar, children, aviso }) {
    const ref = useRef(null);

    useEffect(() => {
        const d = ref.current;
        if (d && !d.open) d.showModal();
    }, []);

    const cerrar = () => ref.current?.close();

    return (
        <dialog
            ref={ref}
            aria-label="Detalle"
            onClose={onCerrar}
            onClick={e => { if (e.target === e.currentTarget) cerrar(); }}
        >
            <div className="dlg">
                <button className="cerrar" type="button" aria-label="Cerrar" onClick={cerrar}>✕</button>
                {children(cerrar)}
            </div>
            <Aviso aviso={aviso} />
        </dialog>
    );
}
