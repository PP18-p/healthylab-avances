import { useEffect, useRef, useState } from "react";
import { RECETAS } from "../data/recetas";
import { aItems } from "../utils/lista";
import { fmtIng, norm } from "../utils/formato";
import Aviso from "./Aviso";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const COMIDAS = [["Desayuno", "desayuno"], ["Almuerzo", "almuerzo"], ["Cena", "cena"]];
const BASICOS = /aceite|\bsal\b|miel|salsa/; // ingredientes que casi todos tienen: no cuentan en «¿Qué cocino hoy?»
const textoItem = x => fmtIng({ nombre: x.nombre, unidad: x.uni }, x.cant);

function ListaCompras({ lista, onLista, avisar }) {
    if (!lista.length) {
        return (
            <>
                <h2>Lista de compras</h2>
                <p className="vacio" style={{ padding: "8px 0" }}>Tu lista está vacía. Abre una receta y pulsa «Agregar a la lista».</p>
            </>
        );
    }
    const copiar = () => navigator.clipboard?.writeText(lista.map(x => "- " + textoItem(x)).join("\n"))
        .then(() => avisar("Lista copiada."), () => avisar("No se pudo copiar."));

    return (
        <>
            <h2>Lista de compras</h2>
            <ul className="lista">
                {lista.map((x, i) => (
                    <li key={`${x.nombre}|${x.uni}`} className={x.ok ? "hecho" : ""}>
                        <label>
                            <input type="checkbox" checked={x.ok} onChange={e => onLista(lista.map((y, j) => j === i ? { ...y, ok: e.target.checked } : y))} />
                            {" "}{textoItem(x)}
                        </label>
                        <button type="button" aria-label={`Quitar ${x.nombre}`} onClick={() => onLista(lista.filter((_, j) => j !== i))}>✕</button>
                    </li>
                ))}
            </ul>
            <div className="fila">
                <button className="mini" type="button" onClick={copiar}>Copiar lista</button>
                <button className="mini" type="button" onClick={() => onLista(lista.filter(x => !x.ok))}>Quitar marcados</button>
                <button className="mini" type="button" onClick={() => onLista([])}>Vaciar lista</button>
            </div>
        </>
    );
}

function Favoritos({ favs, onAbrirReceta }) {
    return (
        <>
            <h2>Favoritos</h2>
            {!favs.length
                ? <p className="vacio" style={{ padding: "8px 0" }}>Aún no tienes recetas guardadas. Toca el corazón de una receta.</p>
                : favs.map(id => (
                    <button key={id} className="resultado" type="button" onClick={() => onAbrirReceta(id)}>
                        <span>{RECETAS[id].titulo}<small>{RECETAS[id].minutos} minutos, {RECETAS[id].categoria}</small></span>
                    </button>
                ))}
        </>
    );
}

function Planificador({ plan, onPlan, onAgregarALista, avisar }) {
    function agregarMenu() {
        const ids = Object.values(plan).filter(v => v !== "");
        if (!ids.length) return avisar("Elige al menos una receta en el plan.");
        ids.forEach(id => onAgregarALista(aItems(RECETAS[+id].ingredientes)));
        avisar("Menú agregado a tu lista de compras.");
    }
    function elegir(clave, valor) {
        const nuevo = { ...plan };
        if (valor === "") delete nuevo[clave]; else nuevo[clave] = valor;
        onPlan(nuevo);
    }

    return (
        <>
            <h2>Planificador semanal</h2>
            <div className="plan-wrap">
                <table className="plan">
                    <thead>
                        <tr><th></th>{COMIDAS.map(c => <th key={c[0]}>{c[0]}</th>)}</tr>
                    </thead>
                    <tbody>
                        {DIAS.map((dia, i) => (
                            <tr key={dia}>
                                <th scope="row">{dia}</th>
                                {COMIDAS.map(([nombre, cat], j) => {
                                    const clave = `${i}-${j}`;
                                    return (
                                        <td key={clave}>
                                            <select aria-label={`${dia}, ${nombre}`} value={plan[clave] ?? ""} onChange={e => elegir(clave, e.target.value)}>
                                                <option value="">Sin elegir</option>
                                                {RECETAS.filter(r => r.categoria === cat).map(r => <option key={r.id} value={String(r.id)}>{r.titulo}</option>)}
                                            </select>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="fila">
                <button className="mini mini--p" type="button" onClick={agregarMenu}>Agregar el menú a la lista de compras</button>
                <button className="mini" type="button" onClick={() => onPlan({})}>Limpiar plan</button>
            </div>
        </>
    );
}

function Despensa({ onAbrirReceta }) {
    const [texto, setTexto] = useState("");
    const tokens = texto.split(/[,\n]+/).map(s => norm(s.trim())).filter(s => s.length > 1);

    const resultados = !tokens.length ? null : RECETAS.map(r => {
        const ings = r.ingredientes.filter(i => !BASICOS.test(norm(i.nombre)));
        const tiene = ings.filter(i => tokens.some(t => norm(i.nombre).includes(t) || t.includes(norm(i.nombre))));
        return { id: r.id, pct: Math.round(tiene.length / ings.length * 100), falta: ings.filter(i => !tiene.includes(i)).map(i => i.nombre) };
    }).filter(x => x.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 6);

    return (
        <>
            <h2>¿Qué cocino hoy?</h2>
            <div className="despensa">
                <label htmlFor="d-ing">Escribe los ingredientes que tienes, separados por comas</label>
                <textarea id="d-ing" placeholder="Ej: huevos, tomate, espinaca, avena" value={texto} onChange={e => setTexto(e.target.value)} />
            </div>
            <div aria-live="polite">
                {resultados && (resultados.length
                    ? resultados.map(x => (
                        <button key={x.id} className="resultado" type="button" onClick={() => onAbrirReceta(x.id)}>
                            <span>{RECETAS[x.id].titulo}<small>{x.falta.length ? "Te falta: " + x.falta.join(", ") : "Tienes todo lo necesario"}</small></span>
                            <strong>{x.pct}%</strong>
                        </button>
                    ))
                    : <p className="vacio" style={{ padding: "12px 0" }}>Ninguna receta coincide todavía. Prueba con otros ingredientes.</p>)}
            </div>
        </>
    );
}

/* Ventana de las herramientas del menú: lista de compras, favoritos, planificador y «¿Qué cocino hoy?» */
export default function Herramientas({ vista, onCerrar, aviso, avisar, lista, onLista, plan, onPlan, favs, onAbrirReceta, onAgregarALista }) {
    const ref = useRef(null);

    useEffect(() => {
        const d = ref.current;
        if (d && !d.open) d.showModal();
    }, []);

    return (
        <dialog
            ref={ref}
            aria-label="Herramienta"
            onClose={onCerrar}
            onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        >
            <button className="cerrar" type="button" aria-label="Cerrar" onClick={() => ref.current.close()}>✕</button>
            <div className="dlg">
                {vista === "lista" && <ListaCompras lista={lista} onLista={onLista} avisar={avisar} />}
                {vista === "favoritos" && <Favoritos favs={favs} onAbrirReceta={onAbrirReceta} />}
                {vista === "plan" && <Planificador plan={plan} onPlan={onPlan} onAgregarALista={onAgregarALista} avisar={avisar} />}
                {vista === "despensa" && <Despensa onAbrirReceta={onAbrirReceta} />}
            </div>
            <Aviso aviso={aviso} />
        </dialog>
    );
}
