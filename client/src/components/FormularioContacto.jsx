import { useState } from "react";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGLAS = {
    nombre: v => !v.trim() ? "Escribe tu nombre." : v.trim().length < 3 ? "El nombre debe tener al menos 3 letras." : "",
    correo: v => !v.trim() ? "Escribe tu correo electrónico." : !CORREO.test(v.trim()) ? "Ingresa un correo válido, por ejemplo nombre@correo.com." : "",
    mensaje: v => !v.trim() ? "Escribe tu mensaje." : v.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : ""
};
const CAMPOS = ["nombre", "correo", "mensaje"];
const VACIO = { nombre: "", correo: "", mensaje: "" };

export default function FormularioContacto({ avisar }) {
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({}); // campo -> mensaje; sin clave = todavía sin revisar

    const clase = c => errores[c] === undefined ? "" : errores[c] ? "invalido" : "valido";

    function revisar(c, v = valores[c]) {
        setErrores(prev => ({ ...prev, [c]: REGLAS[c](v) }));
    }

    function cambiar(c, v) {
        setValores(prev => ({ ...prev, [c]: v }));
        if (errores[c]) revisar(c, v);
    }

    function enviar(e) {
        e.preventDefault();
        const nuevos = Object.fromEntries(CAMPOS.map(c => [c, REGLAS[c](valores[c])]));
        setErrores(nuevos);
        const primero = CAMPOS.find(c => nuevos[c]);
        if (primero) {
            document.getElementById(primero)?.focus();
            return avisar("Revisa los campos marcados.");
        }
        // Aquí irá el envío real a tu servidor (fase 2)
        setValores(VACIO);
        setErrores({});
        avisar("Mensaje enviado. Te responderemos pronto.");
    }

    return (
        <form id="formulario" onSubmit={enviar} noValidate>
            <div className={`campo ${clase("nombre")}`}>
                <label htmlFor="nombre">Nombre</label>
                <input type="text" id="nombre" placeholder="Escribe tu nombre" autoComplete="name" value={valores.nombre}
                    onChange={e => cambiar("nombre", e.target.value)} onBlur={() => revisar("nombre")} aria-invalid={!!errores.nombre} />
                <small className="error" id="error-nombre">{errores.nombre}</small>
            </div>
            <div className={`campo ${clase("correo")}`}>
                <label htmlFor="correo">Correo electrónico</label>
                <input type="email" id="correo" placeholder="Escribe tu correo" autoComplete="email" value={valores.correo}
                    onChange={e => cambiar("correo", e.target.value)} onBlur={() => revisar("correo")} aria-invalid={!!errores.correo} />
                <small className="error" id="error-correo">{errores.correo}</small>
            </div>
            <div className={`campo ${clase("mensaje")}`}>
                <label htmlFor="mensaje">Mensaje</label>
                <textarea id="mensaje" placeholder="Escribe tu mensaje" maxLength={500} value={valores.mensaje}
                    onChange={e => cambiar("mensaje", e.target.value)} onBlur={() => revisar("mensaje")} aria-invalid={!!errores.mensaje} />
                <div className="campo__pie">
                    <small className="error" id="error-mensaje">{errores.mensaje}</small>
                    <small className="caracteres">{valores.mensaje.length} / 500</small>
                </div>
            </div>
            <button type="submit" className="boton">Enviar mensaje</button>
        </form>
    );
}
