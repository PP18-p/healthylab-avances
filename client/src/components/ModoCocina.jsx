import { useEffect, useRef, useState } from "react";
import { callar, hablar, pitar } from "../utils/voz";
import Aviso from "./Aviso";

const reloj = s => {
    const t = Math.max(s, 0);
    return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
};

/* Temporizador de un paso. Se monta con key = paso, así se reinicia solo al cambiar de paso. */
function Temporizador({ minutos, avisar }) {
    const total = minutos * 60;
    const [restante, setRestante] = useState(total);
    const [corriendo, setCorriendo] = useState(false);
    const [terminado, setTerminado] = useState(false);

    useEffect(() => {
        if (!corriendo) return;
        const t = setInterval(() => setRestante(r => r - 1), 1000);
        return () => clearInterval(t);
    }, [corriendo]);

    useEffect(() => {
        if (!corriendo || restante > 0) return;
        setCorriendo(false);
        setTerminado(true);
        setRestante(total);
        pitar();
        avisar("¡Tiempo cumplido!");
    }, [corriendo, restante, total, avisar]);

    const etiqueta = corriendo ? "Pausar" : terminado ? "Reiniciar" : restante < total ? "Reanudar" : "Iniciar temporizador";

    function alternar() {
        if (corriendo) { setCorriendo(false); return; }
        setTerminado(false);
        setCorriendo(true);
    }

    return (
        <div className="cocina__timer">
            <span id="c-reloj">{minutos ? reloj(restante) : ""}</span>
            {minutos > 0 && <button className="mini mini--p" type="button" onClick={alternar}>{etiqueta}</button>}
        </div>
    );
}

/* Evita que la pantalla se apague mientras se cocina (si el navegador lo permite) */
function usePantallaActiva() {
    useEffect(() => {
        let vivo = true;
        let candado = null;
        const pedir = async () => {
            try {
                if (!("wakeLock" in navigator)) return;
                const c = await navigator.wakeLock.request("screen");
                if (vivo) candado = c; else c.release().catch(() => { });
            } catch { /* no permitido */ }
        };
        const alVolver = () => { if (document.visibilityState === "visible") pedir(); };
        pedir();
        document.addEventListener("visibilitychange", alVolver);
        return () => {
            vivo = false;
            document.removeEventListener("visibilitychange", alVolver);
            candado?.release().catch(() => { });
        };
    }, []);
}

/* Receta paso a paso a pantalla completa */
export default function ModoCocina({ receta, onSalir, aviso, avisar }) {
    const ref = useRef(null);
    const [paso, setPaso] = useState(0);
    usePantallaActiva();

    useEffect(() => {
        const d = ref.current;
        if (d && !d.open) d.showModal();
    }, []);

    /* La lectura en voz alta se corta al cambiar de paso y al salir */
    useEffect(() => { callar(); }, [paso]);
    useEffect(() => () => callar(), []);

    const p = receta.pasos[paso];
    const ultimo = paso === receta.pasos.length - 1;

    function siguiente() {
        if (!ultimo) { setPaso(paso + 1); return; }
        ref.current.close();
        avisar("¡Buen provecho!");
    }

    return (
        <dialog ref={ref} className="cocina" aria-label="Modo cocina" onClose={onSalir}>
            <div className="cocina__top">
                <strong>{receta.titulo}</strong>
                <button className="mini" type="button" onClick={() => ref.current.close()}>Salir</button>
            </div>
            <div className="cocina__prog">
                <div style={{ width: `${(paso + 1) / receta.pasos.length * 100}%` }}></div>
            </div>
            <p className="cocina__info">Paso {paso + 1} de {receta.pasos.length}</p>
            <p className="cocina__paso">{p.texto}</p>

            <Temporizador key={paso} minutos={p.minutos} avisar={avisar} />

            <div className="cocina__nav">
                <button className="mini" type="button" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>Anterior</button>
                <button className="mini" type="button" onClick={() => { if (!hablar(p.texto)) avisar("Tu navegador no admite lectura en voz alta."); }}>Escuchar paso</button>
                <button className="mini mini--p" type="button" onClick={siguiente}>{ultimo ? "Terminar" : "Siguiente"}</button>
            </div>

            <Aviso aviso={aviso} />
        </dialog>
    );
}
