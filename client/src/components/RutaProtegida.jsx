import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Exige sesión. Con soloAdmin, además exige ser administrador. */
export default function RutaProtegida({ soloAdmin = false }) {
    const { sesion, cargando } = useAuth();
    if (cargando) return <p>Cargando...</p>;
    if (!sesion) return <Navigate to="/login" replace />;
    if (soloAdmin && sesion.rol !== "admin") return <Navigate to="/recetas" replace />;
    return <Outlet />;
}
