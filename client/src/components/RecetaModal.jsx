import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buscarSustituto } from "../data/recetas";
import { guardarEstado, leerEstado } from "../services/estado";
import { fmtIng, num } from "../utils/formato";
import { aItems } from "../utils/lista";
import { callar, hablar } from "../utils/voz";
import Aviso from "./Aviso";

/* Ficha de una receta. Se monta solo cuando hay una receta abierta (con key = id). */
export default function RecetaModal({ receta, favorita, onFavorita, onCocina, onAgregarALista, onCerrar, aviso, avisar }) {
    const { sesion } = useAuth();
    const ref = useRef(null);
    const [porciones, setPorciones] = useState(receta.porciones);
    const [sustAbiertas, setSustAbiertas] = useState([]);
    const [resenas, setResenas] = useState(() => leerEstado().resenas[receta.id] || []);
    const [estrellas, setEstrellas] = useState(0);
    const [texto, setTexto] = useState("");
    const [leyendo, setLeyendo] = useState(false);

    useEffect(() => {
        const d = ref.current;
        if (d && !d.open) d.showModal();
    }, []);

    /* Al cerrar la ficha se corta la lectura en voz alta */
    useEffect(() => () => callar(), []);

    const factor = porciones / receta.porciones;
    const promedio = resenas.length ? resenas.reduce((a, x) => a + x.e, 0) / resenas.length : 0;
    const n = receta.nutricion;

    const textoParaLeer = () =>
        `${receta.titulo}. Ingredientes: ${receta.ingredientes.map(i => fmtIng(i, i.cantidad * factor)).join(", ")}. ` +
        `Preparación: ${receta.pasos.map((p, k) => `Paso ${k + 1}. ${p.texto}.`).join(" ")}`;

    function alternarVoz() {
        if (leyendo) { callar(); setLeyendo(false); return; }
        if (hablar(textoParaLeer(), () => setLeyendo(false))) setLeyendo(true);
        else avisar("Tu navegador no admite lectura en voz alta.");
    }

    function agregarALista() {
        onAgregarALista(aItems(receta.ingredientes, factor));
        avisar("Ingredientes agregados a tu lista.");
    }

    const alternarSust = k => setSustAbiertas(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

    function publicar() {
        if (!estrellas) return avisar("Elige de 1 a 5 estrellas.");
        if (texto.trim().length < 5) return avisar("Escribe un comentario de al menos 5 caracteres.");
        /* f = fecha de publicación (la usa el panel de administración) */
        const nueva = { n: sesion.nombre, e: estrellas, t: texto.trim(), f: Date.now() };
        const todas = leerEstado().resenas;
        const lista = [...(todas[receta.id] || []), nueva];
        guardarEstado({ resenas: { ...todas, [receta.id]: lista } });
        setResenas(lista);
        setEstrellas(0); setTexto("");
        avisar("Gracias por tu valoración.");
    }

    return (
        <dialog
            ref={ref}
            aria-label={receta.titulo}
            onClose={onCerrar}
            onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        >
            <button className="cerrar" type="button" aria-label="Cerrar" onClick={() => ref.current.close()}>✕</button>
            <div className="rm__media">
                <img src={`/${receta.imagen}`} alt={receta.titulo} />
            </div>

            <div className="rm__cuerpo">
                <h2>{receta.titulo}</h2>
                <div className="rm__meta">
                    <span>{receta.minutos} minutos</span>
                    <span>{receta.categoria}</span>
                    <span>{resenas.length ? `★ ${num(promedio)} (${resenas.length})` : "Sin valoraciones"}</span>
                </div>
                <div className="rm__acciones">
                    <button className="mini mini--p" type="button" onClick={onCocina}>Modo cocina</button>
                    <button className="mini" type="button" aria-pressed={leyendo} onClick={alternarVoz}>
                        {leyendo ? "Detener lectura" : "Escuchar receta"}
                    </button>
                    <button className="mini" type="button" aria-pressed={favorita} onClick={onFavorita}>
                        {favorita ? "En favoritos" : "Guardar en favoritos"}
                    </button>
                    <button className="mini" type="button" onClick={agregarALista}>Agregar a la lista</button>
                </div>

                <h3>Ingredientes</h3>
                <div className="porciones">
                    <button type="button" aria-label="Menos porciones" onClick={() => setPorciones(p => Math.max(1, p - 1))}>−</button>
                    <span aria-live="polite">{porciones} {porciones === 1 ? "porción" : "porciones"}</span>
                    <button type="button" aria-label="Más porciones" onClick={() => setPorciones(p => Math.min(20, p + 1))}>+</button>
                </div>
                <ul id="m-ing">
                    {receta.ingredientes.map((ing, k) => {
                        const sust = buscarSustituto(ing.nombre);
                        const abierta = sustAbiertas.includes(k);
                        return (
                            <li key={ing.nombre}>
                                <span>{fmtIng(ing, ing.cantidad * factor)}</span>
                                {sust && (
                                    <>
                                        <button className="sust" type="button" onClick={() => alternarSust(k)}>{abierta ? "Ocultar" : "Sustituir"}</button>
                                        {abierta && <span className="sust-txt">Puedes usar: {sust}.</span>}
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <h3>Información nutricional por porción</h3>
                <dl className="nut">
                    <div><dt>Calorías</dt><dd>{n.calorias} kcal</dd></div>
                    <div><dt>Proteínas</dt><dd>{n.proteinas} g</dd></div>
                    <div><dt>Carbohidratos</dt><dd>{n.carbohidratos} g</dd></div>
                    <div><dt>Grasas</dt><dd>{n.grasas} g</dd></div>
                </dl>
                <p className="nut-nota">Valores aproximados. Pueden variar según las marcas y las cantidades que uses.</p>

                <h3>Preparación</h3>
                <ol>
                    {receta.pasos.map(p => (
                        <li key={p.texto}>{p.texto}{p.minutos ? ` (${p.minutos} min)` : ""}</li>
                    ))}
                </ol>

                <h3>Valoraciones y comentarios</h3>
                <div>
                    {resenas.length ? resenas.slice().reverse().map(r => (
                        <div className="resena" key={`${r.f}-${r.n}-${r.t}`}>
                            <b>{r.n}</b><span className="est">{"★".repeat(r.e)}</span>
                            <p>{r.t}</p>
                        </div>
                    )) : <p className="vacio" style={{ padding: "8px 0" }}>Sé la primera persona en valorar esta receta.</p>}
                </div>
                <div className="resena-form">
                    <div className="estrellas" role="group" aria-label="Tu valoración">
                        {[1, 2, 3, 4, 5].map(v => (
                            <button key={v} type="button" className={v <= estrellas ? "on" : ""} aria-label={`${v} de 5`} onClick={() => setEstrellas(v)}>★</button>
                        ))}
                    </div>
                    <textarea placeholder="¿Qué te pareció la receta?" maxLength={300} value={texto} onChange={e => setTexto(e.target.value)} />
                    <button className="mini mini--p" type="button" onClick={publicar}>Publicar valoración</button>
                </div>
            </div>

            {/* El aviso va dentro del diálogo: lo de afuera queda tapado por la ventana */}
            <Aviso aviso={aviso} />
        </dialog>
    );
}
