import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* PROVISIONAL: se reemplaza al migrar admin.html */
export default function Admin() {
    const { salir } = useAuth();
    return (
        <main>
            <h1>Panel de administración</h1>
            <p>Panel (pendiente de migrar).</p>
            <p><Link to="/recetas">Ver sitio</Link></p>
            <button type="button" onClick={salir}>Salir</button>
        </main>
    );
}
