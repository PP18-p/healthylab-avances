import { useState } from "react";

/* Campo de formulario con etiqueta, mensaje de error y (opcional) botón mostrar/ocultar contraseña.
   revisado: ya se validó. error: mensaje ("" si es válido). */
export default function Campo({ id, etiqueta, valor, onChange, onBlur, revisado, error, tipo = "text", clave = false, ...resto }) {
    const [ver, setVer] = useState(false);
    const clase = revisado ? (error ? "invalido" : "valido") : "";

    const input = (
        <input
            id={id}
            type={clave && ver ? "text" : tipo}
            value={valor}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={revisado && !!error}
            {...resto}
        />
    );

    return (
        <div className={`campo ${clase}`}>
            <label htmlFor={id}>{etiqueta}</label>
            {clave ? (
                <div className="clave">
                    {input}
                    <button
                        type="button"
                        className="ver"
                        onClick={() => setVer(!ver)}
                        aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {ver ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
            ) : input}
            <small className="error" id={`err-${id}`}>{error}</small>
        </div>
    );
}
