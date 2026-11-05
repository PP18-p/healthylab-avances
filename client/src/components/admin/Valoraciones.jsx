import { useState } from "react";
import { RECETAS } from "../../data/recetas";
import { useDatos } from "../../hooks/useDatos";
import { cargarValoraciones, eliminarResena } from "../../services/admin";
import { dec, estrellasTxt, fFecha, promedio } from "../../utils/estadisticas";
import Carga from "./Carga";
import { Kpi } from "./Graficos";

const FILTROS = [[0, "Todas"], [5, "5 ★"], [4, "4 ★"], [3, "3 ★"], [2, "2 ★"], [1, "1 ★"]];

export default function Valoraciones({ ui, refrescar, version }) {
    const [estrellas, setEstrellas] = useState(0);
    const { datos: todas, error } = useDatos(cargarValoraciones, version);
    if (!todas) return <Carga error={error} />;

    const porReceta = RECETAS.map(r => ({ id: r.id, t: r.titulo, l: Array.isArray(todas[r.id]) ? todas[r.id] : [] }));
    const total = porReceta.reduce((a, r) => a + r.l.length, 0);
    const valoradas = porReceta.filter(r => r.l.length);
    const suma = porReceta.reduce((a, r) => a + r.l.reduce((b, x) => b + x.e, 0), 0);
    const mejor = valoradas.slice().sort((a, b) => promedio(b.l) - promedio(a.l) || b.l.length - a.l.length)[0];
    const ranking = valoradas.slice().sort((a, b) => promedio(b.l) - promedio(a.l));

    const filas = [];
    porReceta.forEach(r => r.l.forEach(x => { if (!estrellas || x.e === estrellas) filas.push({ t: r.t, x }); }));
    filas.sort((a, b) => (b.x.f || 0) - (a.x.f || 0));

    async function eliminar(f) {
        if (!await ui.confirmar("Eliminar comentario", `Se eliminará el comentario de ${f.x.n} en «${f.t}». Esta acción no se puede deshacer.`, "Eliminar")) return;
        const r = await eliminarResena(f.x.id);
        ui.avisar(r.ok ? "Comentario eliminado." : r.error);
        refrescar();
    }

    return (
        <section className="vista">
            <div className="kpis">
                <Kpi titulo="Valoraciones" valor={total} detalle="comentarios recibidos" />
                <Kpi titulo="Promedio general" valor={total ? dec(suma / total) + " ★" : "-"} detalle="de 5 estrellas" />
                <Kpi titulo="Recetas valoradas" valor={`${valoradas.length} de ${RECETAS.length}`} detalle="tienen al menos una reseña" />
                <Kpi titulo="Mejor valorada" valor={mejor ? mejor.t : "-"} detalle={mejor ? `${dec(promedio(mejor.l))} ★ (${mejor.l.length})` : "aún sin reseñas"} />
            </div>

            <div className="panel">
                <h3>Promedio por receta</h3>
                {ranking.length
                    ? <ul className="rank">{ranking.map(r => (
                        <li key={r.id}>
                            <div><span>{r.t}</span><b>{dec(promedio(r.l))} ★ <small className="suave">({r.l.length})</small></b></div>
                            <span className="f"><i style={{ "--w": `${Math.round(promedio(r.l) / 5 * 100)}%` }}></i></span>
                        </li>))}</ul>
                    : <p className="suave">Todavía no hay valoraciones. Aparecerán aquí cuando alguien califique una receta.</p>}
            </div>

            <div className="herramientas" style={{ marginTop: 28 }}>
                <h2 className="sub-tit">Comentarios</h2>
                <div className="filtros" role="group" aria-label="Filtrar comentarios por estrellas">
                    {FILTROS.map(([v, t]) => <button key={v} type="button" className={`filtro ${estrellas === v ? "activo" : ""}`} onClick={() => setEstrellas(v)}>{t}</button>)}
                </div>
            </div>

            {filas.length
                ? <ul className="feed" style={{ gap: 10 }}>{filas.map(f => (
                    <li key={f.x.id} style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 280px" }}>
                            <b>{f.x.n}</b> <span aria-label={`${f.x.e} de 5 estrellas`} style={{ color: "#e5a50a" }}>{estrellasTxt(f.x.e)}</span>
                            <small className="suave" style={{ display: "block", whiteSpace: "normal" }}>{f.t}{f.x.f ? " · " + fFecha(f.x.f) : ""}</small>
                            <p style={{ margin: "6px 0 0", overflowWrap: "anywhere" }}>{f.x.t}</p>
                        </div>
                        <button className="mini mini--peligro" type="button" onClick={() => eliminar(f)}>Eliminar</button>
                    </li>))}</ul>
                : <p className="vacio">{total ? "No hay comentarios con ese filtro." : "Aún no hay comentarios."}</p>}
        </section>
    );
}
