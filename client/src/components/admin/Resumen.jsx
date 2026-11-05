import { useDatos } from "../../hooks/useDatos";
import { cargarResumen } from "../../services/admin";
import { DIA, contar, fDia, hace, inicioDia, nombrePag, unicos } from "../../utils/estadisticas";
import Carga from "./Carga";
import { Barras, Kpi, Ranking } from "./Graficos";

export default function Resumen({ version }) {
    const { datos, error } = useDatos(cargarResumen, version);
    if (!datos) return <Carga error={error} />;

    const { visitas: ev, cuentas: us, conectados } = datos, h0 = inicioDia();
    const hoy = ev.filter(e => e.t >= h0), sem = ev.filter(e => e.t >= h0 - 6 * DIA);
    const activas = us.filter(u => u.estado === "activo").length;
    const nuevas7 = us.filter(u => u.creado >= h0 - 6 * DIA).length, nuevasHoy = us.filter(u => u.creado >= h0).length;

    /* Visitantes recurrentes: los que volvieron en otra sesión */
    const porV = {};
    ev.forEach(e => (porV[e.v] = porV[e.v] || new Set()).add(e.s));
    const vs = Object.values(porV);
    const recurr = vs.length ? Math.round(vs.filter(s => s.size > 1).length / vs.length * 100) : 0;

    const dias = [];
    for (let i = 6; i >= 0; i--) {
        const d = h0 - i * DIA;
        dias.push({ n: fDia(d), v: ev.filter(e => e.t >= d && e.t < d + DIA).length });
    }

    const act = [];
    us.forEach(u => {
        act.push({ t: u.creado, x: `Nueva cuenta: ${u.nombre}`, k: "n" + u.id });
        if (u.ultimo) act.push({ t: u.ultimo, x: `Inicio de sesión: ${u.nombre}`, k: "i" + u.id });
    });
    act.sort((a, b) => b.t - a.t);

    return (
        <section className="vista">
            <div className="kpis">
                <Kpi titulo="Conectados ahora" valor={conectados.length} detalle="activos en los últimos 45 s" vivo />
                <Kpi titulo="Visitas hoy" valor={hoy.length} detalle={`${unicos(hoy)} visitantes únicos`} />
                <Kpi titulo="Visitas en 7 días" valor={sem.length} detalle={`${unicos(sem)} visitantes únicos`} />
                <Kpi titulo="Cuentas registradas" valor={us.length} detalle={`${activas} activas, ${us.length - activas} suspendidas`} />
                <Kpi titulo="Cuentas nuevas" valor={nuevas7} detalle={`en 7 días (${nuevasHoy} hoy)`} />
                <Kpi titulo="Visitantes recurrentes" valor={recurr + "%"} detalle="han vuelto en otra sesión" />
            </div>
            <div className="rejilla2">
                <div className="panel"><h3>Visitas de los últimos 7 días</h3><Barras items={dias} /></div>
                <div className="panel"><h3>Páginas más vistas</h3><Ranking items={contar(ev, e => nombrePag(e.p)).slice(0, 5)} vacio="Todavía no hay visitas registradas." /></div>
            </div>
            <div className="rejilla2">
                <div className="panel"><h3>Dispositivos</h3><Ranking items={contar(ev, e => e.d)} vacio="Todavía no hay visitas registradas." /></div>
                <div className="panel">
                    <h3>Actividad reciente</h3>
                    {act.length
                        ? <ul className="feed">{act.slice(0, 8).map(a => <li key={a.k + a.t}><span>{a.x}</span><small>{hace(a.t)}</small></li>)}</ul>
                        : <p className="suave">Cuando alguien cree una cuenta o inicie sesión, aparecerá aquí.</p>}
                </div>
            </div>
        </section>
    );
}
