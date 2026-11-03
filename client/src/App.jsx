import { Navigate, Route, Routes } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";
import Seguimiento from "./components/Seguimiento";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Hlp from "./pages/Hlp";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <>
      <Seguimiento />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Solo con sesión */}
        <Route element={<RutaProtegida />}>
          <Route path="/recetas" element={<Hlp />} />
        </Route>

        {/* Solo administrador */}
        <Route element={<RutaProtegida soloAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
