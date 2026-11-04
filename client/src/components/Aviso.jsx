export default function Aviso({ aviso }) {
    return (
        <div className={`aviso ${aviso.visible ? "visible" : ""}`} role="status" aria-live="polite">
            {aviso.texto}
        </div>
    );
}
