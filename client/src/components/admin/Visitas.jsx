import { useState } from "react";
import { leerConectados, leerVisitas } from "../../services/admin";
import { DIA, contar, fDia, hace, inicioDia, nombrePag, sesiones, unicos } from "../../utils/estadisticas";
import { Barras, Kpi, Ranking } from "./Graficos";

const RANGOS = [[1, "Hoy"], [7, "7 días"], [30, "30 días"], [0, "Todo"]];

export default function Visitas() {
    const [rango, setRango] = useState(7);
    const vivos = leerConectados();
    const h0 = inicioDia();
    const desde = rango === 0 ? 0 : h0 - (rango - 1) * DIA;
    const ev = leerVisitas().filter(e => e.t >= desde);
    const ses = sesiones(ev);

    const n = rango === 1 ? 1 : rango === 0 ? 30 : rango, dias = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = h0 - i * DIA;
        dias.push({ n: fDia(d), l: n > 10 && i % 5 !== 0 ? "" : fDia(d), v: ev.filter(e => e.t >= d && e.t < d + DIA).length });
    }
    const horas = Array.from({ length: 24 }, (_, h) => ({ n: String(h).padStart(2, "0") + ":00", l: h % 3 === 0 ? String(h).padStart(2, "0") : "", v: 0 }));
    ev.forEach(e => horas[new Date(e.t).getHours()].v++);

    return (
        <section className="vista">
            <div className="panel">
                <h3 className="vivo">Conectados ahora</h3>
                {vivos.length
                    ? <ul className="feed">{vivos.map(v => <li key={v.sid}><span>{v.u || "Visitante"} · {nombrePag(v.p)} · {v.d}</span><small>{hace(v.t)}</small></li>)}</ul>
                    : <p className="suave">No hay nadie conectado en este momento.</p>}
            </div>

            <div className="herramientas" style={{ marginTop: 28 }}>
                <h2 className="sub-tit">Estadísticas del periodo</h2>
                <div className="filtros" role="group" aria-label="Periodo">
                    {RANGOS.map(([v, t]) => <button key={v} type="button" className={`filtro ${rango === v ? "activo" : ""}`} onClick={() => setRango(v)}>{t}</button>)}
                </div>
            </div>

            <div className="kpis">
                <Kpi titulo="Visitas" valor={ev.length} detalle="páginas vistas" />
                <Kpi titulo="Visitantes únicos" valor={unicos(ev)} detalle="dispositivos distintos" />
                <Kpi titulo="Sesiones" valor={ses} detalle="visitas separadas" />
                <Kpi titulo="Páginas por sesión" valor={ses ? (ev.length / ses).toFixed(1).replace(".", ",") : "0"} detalle="promedio" />
            </div>
            <div className="rejilla2">
                <div className="panel"><h3>{rango === 0 ? "Visitas por día (últimos 30)" : "Visitas por día"}</h3><Barras items={dias} densa={n > 10} /></div>
                <div className="panel"><h3>Visitas por hora del día</h3><Barras items={horas} densa /></div>
            </div>
            <div className="rejilla2">
                <div className="panel"><h3>Páginas</h3><Ranking items={contar(ev, e => nombrePag(e.p))} vacio="Sin visitas en este periodo." /></div>
                <div className="panel"><h3>Dispositivos</h3><Ranking items={contar(ev, e => e.d)} vacio="Sin visitas en este periodo." /></div>
            </div>
        </section>
    );
}
