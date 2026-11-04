import { useEffect, useRef } from "react";

/* Menú lateral (botón de tres líneas). Los hijos son las herramientas de cocina (parte 2). */
export default function Cajon({ abierto, onCerrar, textoGrande, onTextoGrande, volverA, children }) {
    const ref = useRef(null);
    const cerrarRef = useRef(null);
    const antes = useRef(abierto);

    /* El menú cerrado no debe poder enfocarse con el teclado */
    useEffect(() => { ref.current.inert = !abierto; }, [abierto]);

    /* Mueve el foco al abrir y lo devuelve al botón al cerrar */
    useEffect(() => {
        if (antes.current === abierto) return;
        antes.current = abierto;
        if (abierto) cerrarRef.current.focus();
        else volverA?.current?.focus({ preventScroll: true });
    }, [abierto, volverA]);

    /* Escape cierra y el fondo no se desplaza mientras está abierto */
    useEffect(() => {
        if (!abierto) return;
        const tecla = e => { if (e.key === "Escape") onCerrar(); };
        document.addEventListener("keydown", tecla);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", tecla); document.body.style.overflow = ""; };
    }, [abierto, onCerrar]);

    return (
        <>
            {abierto && <div className="velo" onClick={onCerrar} />}
            <aside ref={ref} className={`cajon ${abierto ? "abierto" : ""}`} aria-label="Menú de herramientas">
                <div className="cajon__cab">
                    <h2>Menú</h2>
                    <button ref={cerrarRef} className="btn-icono" type="button" aria-label="Cerrar menú" onClick={onCerrar}>✕</button>
                </div>
                <nav className="cajon__nav solo-movil" aria-label="Secciones">
                    <a href="#inicio" onClick={onCerrar}>Inicio</a>
                    <a href="#recetas" onClick={onCerrar}>Recetas</a>
                    <a href="#contacto" onClick={onCerrar}>Contáctanos</a>
                </nav>

                {children}

                <p className="cajon__tit">Accesibilidad</p>
                <button className="cajon__item" type="button" aria-pressed={textoGrande} onClick={onTextoGrande}>
                    Texto ampliado<small>Aumenta el tamaño de las letras</small>
                </button>
                <p className="cajon__nota">
                    Abre cualquier receta para ajustar porciones, ver la información nutricional,
                    usar el modo cocina, ver sustituciones, escucharla en voz alta y dejar tu valoración.
                </p>
            </aside>
        </>
    );
}
