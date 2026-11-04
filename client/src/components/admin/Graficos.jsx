/* Piezas visuales del panel: tarjeta de dato, barras y ranking */

export function Kpi({ titulo, valor, detalle, vivo }) {
    return (
        <div className="kpi">
            <span className={vivo ? "vivo" : ""}>{titulo}</span>
            <strong>{valor}</strong>
            <small>{detalle}</small>
        </div>
    );
}

export function Barras({ items, densa }) {
    const max = Math.max(1, ...items.map(i => i.v));
    return (
        <div className={`barras ${densa ? "densa" : ""}`} role="img" aria-label="Gráfico de barras">
            {items.map((i, k) => (
                <div key={k} className="barra" title={`${i.n}: ${i.v}`}>
                    <b>{i.v}</b>
                    <i style={{ "--h": `${Math.round(i.v / max * 120)}px` }}></i>
                    <small>{i.l ?? i.n}</small>
                </div>
            ))}
        </div>
    );
}

export function Ranking({ items, vacio }) {
    if (!items.length) return <p className="suave">{vacio}</p>;
    const total = items.reduce((a, i) => a + i.v, 0), max = items[0].v;
    return (
        <ul className="rank">
            {items.map(i => (
                <li key={i.n}>
                    <div><span>{i.n}</span><b>{i.v} <small className="suave">({Math.round(i.v / total * 100)}%)</small></b></div>
                    <span className="f"><i style={{ "--w": `${Math.round(i.v / max * 100)}%` }}></i></span>
                </li>
            ))}
        </ul>
    );
}
