/* Lo que se muestra mientras llega la primera carga de una vista, o si falla */
export default function Carga({ error }) {
    return (
        <section className="vista">
            <p className="vacio" role={error ? "alert" : undefined}>{error || "Cargando..."}</p>
        </section>
    );
}
