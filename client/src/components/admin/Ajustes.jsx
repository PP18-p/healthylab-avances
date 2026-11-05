import { useState } from "react";
import { cambiarClaveAdmin } from "../../services/auth";
import { crearRespaldo, reiniciarEstadisticas } from "../../services/admin";
import { descargar } from "../../utils/estadisticas";

export default function Ajustes({ ui, refrescar }) {
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [rep, setRep] = useState("");
    const [error, setError] = useState("");

    async function cambiar(e) {
        e.preventDefault();
        if (nueva !== rep) { setError("Las contraseñas nuevas no coinciden."); return; }
        const r = await cambiarClaveAdmin(actual, nueva);
        setError(r.ok ? "" : r.error);
        if (!r.ok) return;
        setActual(""); setNueva(""); setRep("");
        ui.avisar("Contraseña actualizada.");
    }

    async function reiniciar() {
        if (!await ui.confirmar("Reiniciar estadísticas", "Se borrará el historial de visitas. Las cuentas no se tocan.", "Reiniciar")) return;
        const r = await reiniciarEstadisticas();
        ui.avisar(r.ok ? "Estadísticas reiniciadas." : r.error);
        refrescar();
    }

    async function respaldar() {
        const r = await crearRespaldo();
        if (!r.ok) { ui.avisar(r.error); return; }
        descargar("respaldo-healthylab.json", JSON.stringify(r.datos, null, 2), "application/json");
    }

    return (
        <section className="vista">
            <div className="rejilla2">
                <div className="panel">
                    <h3>Contraseña del administrador</h3>
                    <form onSubmit={cambiar} noValidate>
                        <div className="campo"><label htmlFor="a-actual">Contraseña actual</label>
                            <input type="password" id="a-actual" autoComplete="current-password" value={actual} onChange={e => setActual(e.target.value)} />
                        </div>
                        <div className="campo"><label htmlFor="a-nueva">Nueva contraseña</label>
                            <input type="password" id="a-nueva" autoComplete="new-password" placeholder="Mínimo 10 caracteres" value={nueva} onChange={e => setNueva(e.target.value)} />
                        </div>
                        <div className="campo"><label htmlFor="a-rep">Repite la nueva contraseña</label>
                            <input type="password" id="a-rep" autoComplete="new-password" value={rep} onChange={e => setRep(e.target.value)} />
                        </div>
                        <small className="error" role="alert">{error}</small>
                        <button type="submit" className="boton">Cambiar contraseña</button>
                    </form>
                </div>
                <div className="panel">
                    <h3>Datos</h3>
                    <p className="suave">Descarga una copia de las cuentas (sin contraseñas) y de las estadísticas de visitas, o reinicia las estadísticas.</p>
                    <div className="fila">
                        <button className="mini" type="button" onClick={respaldar}>Descargar respaldo</button>
                        <button className="mini mini--peligro" type="button" onClick={reiniciar}>Reiniciar estadísticas</button>
                    </div>
                    <p className="nut-nota">Los datos se guardan en la base de datos del servidor. Las visitas se borran solas a los 90 días.</p>
                </div>
            </div>
        </section>
    );
}
