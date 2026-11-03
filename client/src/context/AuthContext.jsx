import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as auth from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(null);
    const [cargando, setCargando] = useState(true);

    /* Al abrir la app, revisa si ya había una sesión guardada */
    useEffect(() => {
        let vivo = true;
        auth.obtenerSesion().then(s => {
            if (vivo) { setSesion(s); setCargando(false); }
        });
        return () => { vivo = false; };
    }, []);

    const login = useCallback(async (id, pass) => {
        const r = await auth.login(id, pass);
        if (r.ok) setSesion(await auth.obtenerSesion());
        return r;
    }, []);

    /* Crear cuenta e iniciar sesión de una vez */
    const registrar = useCallback(async datos => {
        const r = await auth.registrar(datos);
        if (!r.ok) return r;
        return login(datos.correo, datos.pass);
    }, [login]);

    const salir = useCallback(async () => {
        await auth.salir();
        setSesion(null);
    }, []);

    return (
        <AuthContext.Provider value={{ sesion, cargando, login, registrar, salir }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
