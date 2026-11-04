import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTema } from "../hooks/useTema";
import "../styles/inicio.css";

const DATOS = [
    { icono: "🥗", color: "c-verde", titulo: "Recetas nutritivas", texto: "Desayunos, almuerzos, cenas y snacks balanceados para todos los días." },
    { icono: "⏱️", color: "c-naranja", titulo: "Rápidas y simples", texto: "Preparaciones cortas, con pocos ingredientes y pasos claros." },
    { icono: "📊", color: "c-azul", titulo: "Información nutricional", texto: "Conoce calorías y nutrientes de cada receta para decidir mejor." },
    { icono: "⭐", color: "c-morado", titulo: "Tus favoritas", texto: "Guarda las recetas que más te gustan y vuelve a ellas cuando quieras." }
];

const PASOS = [
    { titulo: "Crea tu cuenta", texto: "Regístrate con un usuario y una contraseña, es gratis y toma un minuto." },
    { titulo: "Explora las recetas", texto: "Busca por tipo de comida o por los ingredientes que tengas en casa." },
    { titulo: "Cocina y disfruta", texto: "Sigue los pasos, ajusta las porciones y come mejor cada día." }
];

export default function Index() {
    const { sesion } = useAuth();
    const navigate = useNavigate();
    useTema(); // aplica el modo claro/oscuro guardado (esta página no tiene botón para cambiarlo)

    useEffect(() => { document.title = "HealthyLab"; }, []);

    /* Con sesión iniciada: el administrador va al panel y cualquier otra persona a las recetas */
    if (sesion) return <Navigate to={sesion.rol === "admin" ? "/admin" : "/recetas"} replace />;

    return (
        <div className="pagina-index">
            <header>
                <div className="encabezado__interior">
                    <a href="#inicio" className="logo">Healthy<span>Lab</span></a>

                    <nav className="nav" aria-label="Principal">
                        <Link to="/login#crear" className="nav__link">Regístrate</Link>
                        <Link to="/login" className="nav__link">Inicia sesión</Link>
                    </nav>
                </div>
            </header>

            <main id="inicio">
                <section className="presentacion">
                    <h1>HealthyLab</h1>
                    <h2>Un lugar para empezar a cuidar tu alimentación sin tanta ciencia</h2>
                    <button type="button" className="filtro" onClick={() => navigate("/login#crear")}>Únete</button>
                </section>

                <section className="bloque">
                    <h3>¿Qué es HealthyLab?</h3>
                    <p className="intro">
                        HealthyLab es una página pensada para quienes quieren comer mejor sin complicarse.
                        Reúne recetas nutritivas, fáciles de preparar y con ingredientes que se consiguen en
                        cualquier mercado, explicadas paso a paso y sin términos difíciles.
                    </p>
                </section>

                <section className="bloque">
                    <h3>Qué ofrecemos</h3>
                    <div className="rejilla">
                        {DATOS.map(d => (
                            <article className="dato" key={d.titulo}>
                                <span className={`icono ${d.color}`}>{d.icono}</span>
                                <h4>{d.titulo}</h4>
                                <p>{d.texto}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bloque">
                    <h3>Cómo funciona</h3>
                    <ol className="pasos">
                        {PASOS.map((p, i) => (
                            <li key={p.titulo}>
                                <span className="numero">{i + 1}</span>
                                <div>
                                    <h4>{p.titulo}</h4>
                                    <p>{p.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="llamado">
                    <h3>¿Listo para empezar?</h3>
                    <p>Únete a HealthyLab y arma tu forma de comer, a tu ritmo.</p>
                    <button type="button" className="filtro" onClick={() => navigate("/login#crear")}>Crear mi cuenta</button>
                </section>
            </main>

            <footer className="pie">
                <p>Healthy<span>Lab</span> · Cuida tu alimentación sin tanta ciencia</p>
            </footer>
        </div>
    );
}
