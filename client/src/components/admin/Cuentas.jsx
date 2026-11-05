import { useState } from "react";
import { registrar } from "../../services/auth";
import { useDatos } from "../../hooks/useDatos";
import { alternarEstado, cargarCuentas, claveTemporal, eliminarCuenta, restablecerClave } from "../../services/admin";
import { norm } from "../../utils/formato";
import { descargar, fFecha } from "../../utils/estadisticas";
import Carga from "./Carga";

const ESTADOS = [["todas", "Todas"], ["activo", "Activas"], ["suspendido", "Suspendidas"]];

function FormNuevaCuenta({ cerrar, ui, refrescar }) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [pass, setPass] = useState("");
    const [verPass, setVerPass] = useState(false);
    const [error, setError] = useState("");

    async function crear(e) {
        e.preventDefault();
        const r = await registrar({ nombre, correo, pass });
        if (!r.ok) { setError(r.error); return; }
        cerrar();
        ui.avisar("Cuenta creada.");
        refrescar();
    }

    return (
        <>
            <h2>Nueva cuenta</h2>
            <form onSubmit={crear} noValidate>
                <div className="campo"><label htmlFor="n-nombre">Nombre</label>
                    <input type="text" id="n-nombre" autoComplete="off" autoFocus value={nombre} onChange={e => setNombre(e.target.value)} /></div>
                <div className="campo"><label htmlFor="n-correo">Correo electrónico</label>
                    <input type="email" id="n-correo" autoComplete="off" value={correo} onChange={e => setCorreo(e.target.value)} /></div>
                <div className="campo"><label htmlFor="n-pass">Contraseña</label>
                    <input type={verPass ? "text" : "password"} id="n-pass" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={pass} onChange={e => setPass(e.target.value)} /></div>
                <small className="error" role="alert">{error}</small>
                <div className="fila" style={{ margin: 0 }}>
                    <button className="mini" type="button" onClick={() => { setPass(claveTemporal()); setVerPass(true); }}>Generar contraseña</button>
                    <button className="mini mini--p" type="submit">Crear cuenta</button>
                </div>
            </form>
        </>
    );
}

export default function Cuentas({ ui, refrescar, version }) {
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("todas");
    const { datos: todas, error } = useDatos(cargarCuentas, version);
    if (!todas) return <Carga error={error} />;

    const lista = todas.filter(u => (estado === "todas" || u.estado === estado) && norm(u.nombre + " " + u.correo).includes(norm(busqueda.trim())));

    const detalle = u => ui.abrir(() => (
        <>
            <h2>{u.nombre}</h2>
            <dl>
                <dt>Correo</dt><dd>{u.correo}</dd>
                <dt>Estado</dt><dd>{u.estado === "activo" ? "Activa" : "Suspendida"}</dd>
                <dt>Creada</dt><dd>{fFecha(u.creado)}</dd>
                <dt>Último acceso</dt><dd>{fFecha(u.ultimo)}</dd>
                <dt>Inicios de sesión</dt><dd>{u.accesos || 0}</dd>
            </dl>
        </>
    ));

    async function cambiarEstado(u) {
        const r = await alternarEstado(u.id);
        if (r.ok) ui.avisar(r.estado === "activo" ? "Cuenta activada." : "Cuenta suspendida.");
        else ui.avisar(r.error);
        refrescar();
    }

    async function nuevaClave(u) {
        if (!await ui.confirmar("Restablecer contraseña", `Se generará una contraseña temporal para ${u.nombre}. La anterior dejará de funcionar.`, "Generar")) return;
        const r = await restablecerClave(u.id);
        if (!r.ok) { ui.avisar(r.error); refrescar(); return; }
        const t = r.clave;
        ui.abrir(cerrar => (
            <>
                <h2>Contraseña temporal</h2>
                <p className="suave">Compártela con {u.nombre}. No volverá a mostrarse.</p>
                <div className="clave-temp">{t}</div>
                <div className="fila">
                    <button className="mini mini--p" type="button" onClick={() => navigator.clipboard?.writeText(t).then(() => ui.avisar("Copiada."), () => ui.avisar("No se pudo copiar."))}>Copiar</button>
                    <button className="mini" type="button" onClick={cerrar}>Cerrar</button>
                </div>
            </>
        ));
    }

    async function borrar(u) {
        if (!await ui.confirmar("Eliminar cuenta", `Se eliminará la cuenta de ${u.nombre} (${u.correo}). Esta acción no se puede deshacer.`, "Eliminar")) return;
        const r = await eliminarCuenta(u.id);
        ui.avisar(r.ok ? "Cuenta eliminada." : r.error);
        refrescar();
    }

    function exportarCsv() {
        if (!todas.length) return ui.avisar("No hay cuentas para exportar.");
        const celda = v => { v = String(v ?? ""); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
        const filas = [["Nombre", "Correo", "Creada", "Último acceso", "Inicios de sesión", "Estado"],
            ...todas.map(u => [u.nombre, u.correo, fFecha(u.creado), fFecha(u.ultimo), u.accesos || 0, u.estado])];
        descargar("cuentas-healthylab.csv", "﻿" + filas.map(f => f.map(celda).join(",")).join("\r\n"), "text/csv;charset=utf-8");
    }

    return (
        <section className="vista">
            <div className="herramientas">
                <label className="buscador">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                    <input type="search" placeholder="Buscar por nombre o correo" aria-label="Buscar cuentas" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </label>
                <div className="filtros" role="group" aria-label="Filtrar cuentas por estado">
                    {ESTADOS.map(([v, t]) => <button key={v} type="button" className={`filtro ${estado === v ? "activo" : ""}`} onClick={() => setEstado(v)}>{t}</button>)}
                </div>
            </div>
            <div className="seccion__cabecera">
                <p className="contador" aria-live="polite">{todas.length === 1 ? "1 cuenta" : todas.length + " cuentas"}</p>
                <div className="fila" style={{ margin: 0 }}>
                    <button className="mini" type="button" onClick={exportarCsv}>Exportar CSV</button>
                    <button className="mini mini--p" type="button" onClick={() => ui.abrir(cerrar => <FormNuevaCuenta cerrar={cerrar} ui={ui} refrescar={refrescar} />)}>Nueva cuenta</button>
                </div>
            </div>
            <div className="tabla-wrap">
                <table className="tabla">
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Creada</th><th>Último acceso</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {lista.map(u => (
                            <tr key={u.id}>
                                <td><button className="nom" type="button" onClick={() => detalle(u)}>{u.nombre}</button></td>
                                <td>{u.correo}</td>
                                <td>{fFecha(u.creado)}</td>
                                <td>{fFecha(u.ultimo)}</td>
                                <td><span className={`estado estado--${u.estado}`}>{u.estado === "activo" ? "Activa" : "Suspendida"}</span></td>
                                <td><div className="acc">
                                    <button className="mini" type="button" onClick={() => cambiarEstado(u)}>{u.estado === "activo" ? "Suspender" : "Activar"}</button>
                                    <button className="mini" type="button" onClick={() => nuevaClave(u)}>Nueva clave</button>
                                    <button className="mini mini--peligro" type="button" onClick={() => borrar(u)}>Eliminar</button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {lista.length === 0 && (
                <p className="vacio">{todas.length ? "Ninguna cuenta coincide con la búsqueda." : "Aún no hay cuentas. Aparecerán aquí cuando alguien se registre en la página."}</p>
            )}
        </section>
    );
}
