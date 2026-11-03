import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BotonTema from "../components/BotonTema";
import Campo from "../components/Campo";
import "../styles/login.css";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TEXTOS = {
    entrar: ["Bienvenido", "Ingresa con tu usuario o correo."],
    crear: ["Crea tu cuenta", "Guarda tus recetas favoritas y tu lista de compras."]
};

/* Cada regla devuelve el mensaje de error, o "" si el valor es válido */
const REGLAS = {
    eId: v => v.trim() ? "" : "Escribe tu usuario o correo.",
    ePass: v => v ? "" : "Escribe tu contraseña.",
    cNombre: v => !v.trim() ? "Escribe tu nombre." : v.trim().length < 3 ? "El nombre debe tener al menos 3 letras." : "",
    cCorreo: v => !v.trim() ? "Escribe tu correo electrónico." : !CORREO.test(v.trim()) ? "Ingresa un correo válido, por ejemplo nombre@correo.com." : "",
    cPass: v => !v ? "Escribe una contraseña." : v.length < 8 ? "Usa al menos 8 caracteres." : "",
    cPass2: (v, todos) => !v ? "Repite la contraseña." : v !== todos.cPass ? "Las contraseñas no coinciden." : ""
};
const CAMPOS = { entrar: ["eId", "ePass"], crear: ["cNombre", "cCorreo", "cPass", "cPass2"] };
const IDS = { eId: "e-id", ePass: "e-pass", cNombre: "c-nombre", cCorreo: "c-correo", cPass: "c-pass", cPass2: "c-pass2" };
const VACIO = { eId: "", ePass: "", cNombre: "", cCorreo: "", cPass: "", cPass2: "" };

export default function Login() {
    const { sesion, login, registrar } = useAuth();
    const { hash } = useLocation();
    const [tab, setTab] = useState(hash === "#crear" ? "crear" : "entrar");
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({}); // campo -> mensaje; sin clave = todavía sin revisar
    const [general, setGeneral] = useState("");

    useEffect(() => { document.title = "Ingresar | HealthyLab"; }, []);

    /* Si ya hay sesión (o se acaba de iniciar), se va a la página que corresponde */
    if (sesion) return <Navigate to={sesion.rol === "admin" ? "/admin" : "/recetas"} replace />;

    const enfocar = campo => document.getElementById(IDS[campo])?.focus();

    function revisar(campo, vals) {
        const e = REGLAS[campo](vals[campo], vals);
        setErrores(prev => ({ ...prev, [campo]: e }));
    }

    function cambiar(campo, v) {
        const nuevos = { ...valores, [campo]: v };
        setValores(nuevos);
        if (errores[campo]) revisar(campo, nuevos);
        if (campo === "cPass" && nuevos.cPass2) revisar("cPass2", nuevos);
    }

    const salirDeCampo = campo => { if (valores[campo]) revisar(campo, valores); };

    function cambiarPestana(t) {
        setTab(t);
        setGeneral("");
        setTimeout(() => enfocar(t === "entrar" ? "eId" : "cNombre"), 0);
    }

    /* Valida todos los campos del formulario; enfoca el primero con error */
    function validarTodo(lista) {
        const nuevos = {};
        let primero = null;
        lista.forEach(c => {
            nuevos[c] = REGLAS[c](valores[c], valores);
            if (nuevos[c] && !primero) primero = c;
        });
        setErrores(prev => ({ ...prev, ...nuevos }));
        if (primero) enfocar(primero);
        return !primero;
    }

    async function enviarEntrar(e) {
        e.preventDefault();
        setGeneral("");
        if (!validarTodo(CAMPOS.entrar)) return;
        const r = await login(valores.eId, valores.ePass);
        if (r.ok) return; // el contexto guarda la sesión y esta pantalla redirige sola
        setGeneral(r.error);
        setValores(v => ({ ...v, ePass: "" }));
        setErrores(prev => ({ ...prev, eId: undefined, ePass: undefined }));
        enfocar("ePass");
    }

    async function enviarCrear(e) {
        e.preventDefault();
        setGeneral("");
        if (!validarTodo(CAMPOS.crear)) return;
        const r = await registrar({ nombre: valores.cNombre, correo: valores.cCorreo, pass: valores.cPass });
        if (!r.ok) setGeneral(r.error);
    }

    /* Atajo para no repetir las mismas props en cada campo */
    const campo = (c, etiqueta, extra) => (
        <Campo
            id={IDS[c]}
            etiqueta={etiqueta}
            valor={valores[c]}
            onChange={v => cambiar(c, v)}
            onBlur={() => salirDeCampo(c)}
            revisado={errores[c] !== undefined}
            error={errores[c]}
            {...extra}
        />
    );

    return (
        <div className="pagina-login">
            <BotonTema />

            <main className="tarjeta-login">
                <Link to="/" className="logo">Healthy<span>Lab</span></Link>
                <h1 id="titulo">{TEXTOS[tab][0]}</h1>
                <p className="subtitulo">{TEXTOS[tab][1]}</p>

                <div className="pestanas" role="group" aria-label="Acceso">
                    <button type="button" className={`pestana ${tab === "entrar" ? "activo" : ""}`} onClick={() => cambiarPestana("entrar")}>Ingresar</button>
                    <button type="button" className={`pestana ${tab === "crear" ? "activo" : ""}`} onClick={() => cambiarPestana("crear")}>Crear cuenta</button>
                </div>

                {tab === "entrar" ? (
                    <form className="formulario" onSubmit={enviarEntrar} noValidate>
                        {campo("eId", "Usuario o correo", { autoComplete: "username", placeholder: "Escribe tu usuario o correo" })}
                        {campo("ePass", "Contraseña", { clave: true, tipo: "password", autoComplete: "current-password", placeholder: "Escribe tu contraseña" })}
                        <small className="error error--general" role="alert">{general}</small>
                        <button type="submit" className="boton">Ingresar</button>
                    </form>
                ) : (
                    <form className="formulario" onSubmit={enviarCrear} noValidate>
                        {campo("cNombre", "Nombre", { autoComplete: "name", placeholder: "Escribe tu nombre" })}
                        {campo("cCorreo", "Correo electrónico", { tipo: "email", autoComplete: "email", placeholder: "Escribe tu correo" })}
                        {campo("cPass", "Contraseña", { clave: true, tipo: "password", autoComplete: "new-password", placeholder: "Mínimo 8 caracteres" })}
                        {campo("cPass2", "Repite la contraseña", { tipo: "password", autoComplete: "new-password", placeholder: "Repite la contraseña" })}
                        <small className="error error--general" role="alert">{general}</small>
                        <button type="submit" className="boton">Crear cuenta</button>
                    </form>
                )}

                <p className="enlaces"><Link to="/">Volver al sitio</Link></p>
            </main>
        </div>
    );
}
