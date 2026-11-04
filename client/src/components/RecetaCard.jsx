import { useState } from "react";

export default function RecetaCard({ receta, favorita, onAbrir, onFavorita }) {
    const [sinImagen, setSinImagen] = useState(false);

    return (
        <article
            className="receta entra"
            tabIndex={0}
            role="button"
            aria-label={`Ver receta: ${receta.titulo}`}
            onClick={e => (e.target.closest(".corazon") ? onFavorita() : onAbrir())}
            onKeyDown={e => { if (e.key === "Enter" && e.target === e.currentTarget) onAbrir(); }}
        >
            {sinImagen ? (
                <figure className="foto sin-imagen">Foto no disponible</figure>
            ) : (
                <figure className="foto">
                    <img src={`/${receta.imagen}`} alt={receta.titulo} loading="lazy" onError={() => setSinImagen(true)} />
                </figure>
            )}
            <h3>{receta.titulo}</h3>
            <button
                type="button"
                className="corazon"
                aria-pressed={favorita}
                aria-label={(favorita ? "Quitar de favoritos: " : "Guardar en favoritos: ") + receta.titulo}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z" />
                </svg>
            </button>
        </article>
    );
}
