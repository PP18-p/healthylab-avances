import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* PROVISIONAL: se reemplaza al migrar index.html */
export default function Index() {
    const { sesion } = useAuth();
    if (sesion) return <Navigate to={sesion.rol === "admin" ? "/admin" : "/recetas"} replace />;
    return (
        <main>
            <h1>HealthyLab</h1>
            <p>Página principal (pendiente de migrar).</p>
            <Link to="/login">Inicia sesión o crea tu cuenta</Link>
        </main>
    );
}
