import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* PROVISIONAL: se reemplaza al migrar hlp.html */
export default function Hlp() {
    const { sesion, salir } = useAuth();
    return (
        <main>
            <h1>Recetas</h1>
            <p>Hola, {sesion.nombre}. Página de recetas (pendiente de migrar).</p>
            {sesion.rol === "admin" && <p><Link to="/admin">Ir al panel</Link></p>}
            <button type="button" onClick={salir}>Salir</button>
        </main>
    );
}
