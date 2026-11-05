import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAviso } from "../hooks/useAviso";
import { sesionVencida } from "../services/auth";
import Aviso from "../components/Aviso";
import BotonTema from "../components/BotonTema";
import Ajustes from "../components/admin/Ajustes";
import Cuentas from "../components/admin/Cuentas";
import Resumen from "../components/admin/Resumen";
import Valoraciones from "../components/admin/Valoraciones";
import Ventana from "../components/admin/Ventana";
import Visitas from "../components/admin/Visitas";
import "../styles/hlp.css";
import "../styles/admin.css";

const VISTAS = [["resumen", "Resumen"], ["cuentas", "Cuentas"], ["trafico", "Visitas"], ["valoraciones", "Valoraciones"], ["ajustes", "Ajustes"]];
const vistaDelHash = () => { const h = location.hash.slice(1); return VISTAS.some(v => v[0] === h) ? h : "resumen"; };

export default function Admin() {
    const { salir } = useAuth();
    const [aviso, avisar] = useAviso();
    const [vista, setVista] = useState(vistaDelHash);
    const [version, setVersion] = useState(0); // al cambiar, la vista abierta vuelve a pedir sus datos
    const [ventana, setVentana] = useState(null); // { id, render, alCerrar }
    const contador = useRef(0);

    const refrescar = useCallback(() => setVersion(v => v + 1), []);

    useEffect(() => { document.title = "Panel de administración | HealthyLab"; }, []);

    /* La vista queda en la dirección (#cuentas...) y los datos se actualizan cada 15 s,
       salvo con la pestaña oculta, para no consultar la base sin necesidad */
    useEffect(() => {
        const alHash = () => setVista(vistaDelHash());
        addEventListener("hashchange", alHash);
        const t = setInterval(async () => {
            if (document.hidden) return;
            if (await sesionVencida()) { salir(); return; }
            refrescar();
        }, 15000);
        return () => { removeEventListener("hashchange", alHash); clearInterval(t); };
    }, [refrescar, salir]);

    function ir(v) {
        setVista(v);
        history.replaceState(null, "", "#" + v);
    }

    /* Ventanas emergentes: abrir(contenido) y confirmar(...) que devuelve true/false */
    const abrir = useCallback((render, alCerrar) => setVentana({ id: ++contador.current, render, alCerrar }), []);
    const confirmar = useCallback((titulo, msg, boton) => new Promise(res => {
        let listo = false;
        const fin = v => { if (!listo) { listo = true; res(v); } };
        abrir(cerrar => (
            <>
                <h2>{titulo}</h2>
                <p className="suave">{msg}</p>
                <div className="fila">
                    <button className="mini mini--p" type="button" onClick={() => { fin(true); cerrar(); }}>{boton}</button>
                    <button className="mini" type="button" onClick={cerrar}>Cancelar</button>
                </div>
            </>
        ), () => fin(false));
    }), [abrir]);

    const ui = { abrir, confirmar, avisar };

    return (
        <div className="pagina-hlp pagina-admin">
            <header className="encabezado">
                <div className="encabezado__interior">
                    <Link to="/recetas" className="logo">Healthy<span>Lab</span></Link>
                    <span className="chip">Admin</span>
                    <div className="acciones">
                        <Link to="/recetas" className="nav__link">Ver sitio</Link>
                        <BotonTema className="btn-icono" />
                        <button className="nav__link" type="button" onClick={salir}>Salir</button>
                    </div>
                </div>
            </header>

            <main className="panel-main">
                <h1 className="vista-tit">Panel de administración</h1>

                <div className="filtros tabs" role="group" aria-label="Secciones del panel">
                    {VISTAS.map(([v, t]) => (
                        <button key={v} type="button" className={`filtro ${vista === v ? "activo" : ""}`} onClick={() => ir(v)}>{t}</button>
                    ))}
                </div>

                {vista === "resumen" && <Resumen version={version} />}
                {vista === "cuentas" && <Cuentas ui={ui} refrescar={refrescar} version={version} />}
                {vista === "trafico" && <Visitas version={version} />}
                {vista === "valoraciones" && <Valoraciones ui={ui} refrescar={refrescar} version={version} />}
                {vista === "ajustes" && <Ajustes ui={ui} refrescar={refrescar} />}
            </main>

            {ventana && (
                <Ventana
                    key={ventana.id}
                    aviso={aviso}
                    onCerrar={() => { ventana.alCerrar?.(); setVentana(v => (v && v.id === ventana.id ? null : v)); }}
                >
                    {ventana.render}
                </Ventana>
            )}
            {!ventana && <Aviso aviso={aviso} />}
        </div>
    );
}
