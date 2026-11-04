import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RECETAS } from "../data/recetas";
import { useAviso } from "../hooks/useAviso";
import { guardarEstado, leerEstado } from "../services/estado";
import { norm } from "../utils/formato";
import { pendientes, sumarALista } from "../utils/lista";
import Aviso from "../components/Aviso";
import BotonTema from "../components/BotonTema";
import Cajon from "../components/Cajon";
import FormularioContacto from "../components/FormularioContacto";
import Herramientas from "../components/Herramientas";
import ModoCocina from "../components/ModoCocina";
import RecetaCard from "../components/RecetaCard";
import RecetaModal from "../components/RecetaModal";
import "../styles/hlp.css";

const FILTROS = [
    ["todas", "Todas"], ["desayuno", "Desayuno"], ["almuerzo", "Almuerzo"], ["cena", "Cena"], ["favoritas", "Favoritas"]
];
const HERRAMIENTAS = [
    ["despensa", "¿Qué cocino hoy?", "Recetas según lo que tienes en casa"],
    ["plan", "Planificador semanal", "Organiza tus comidas de la semana"]
];
const SECCIONES = ["inicio", "recetas", "contacto"];

export default function Hlp() {
    const { sesion, salir } = useAuth();
    const [aviso, avisar] = useAviso();
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todas");
    const [favs, setFavs] = useState(() => leerEstado().favs);
    const [abierta, setAbierta] = useState(null); // id de la receta abierta
    const [lista, setLista] = useState(() => leerEstado().lista || []);
    const [plan, setPlan] = useState(() => leerEstado().plan || {});
    const [herramienta, setHerramienta] = useState(null); // "lista" | "favoritos" | "plan" | "despensa"
    const [cocina, setCocina] = useState(null); // id de la receta en modo cocina
    const [menu, setMenu] = useState(false);
    const [textoGrande, setTextoGrande] = useState(() => !!leerEstado().grande);
    const [seccion, setSeccion] = useState("inicio");
    const [sombra, setSombra] = useState(false);
    const [verSubir, setVerSubir] = useState(false);
    const botonMenu = useRef(null);

    useEffect(() => { document.title = "HealthyLab | Recetas nutritivas"; }, []);

    /* Sombra del encabezado, botón de volver arriba y sección activa del menú */
    useEffect(() => {
        const alDesplazar = () => { setSombra(scrollY > 10); setVerSubir(scrollY > 600); };
        addEventListener("scroll", alDesplazar, { passive: true });
        alDesplazar();
        const obs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setSeccion(en.target.id); }),
            { rootMargin: "-40% 0px -55% 0px" });
        SECCIONES.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
        return () => { removeEventListener("scroll", alDesplazar); obs.disconnect(); };
    }, []);

    /* Texto ampliado: la clase va en <html> porque cambia el tamaño base de las letras */
    useEffect(() => {
        document.documentElement.classList.toggle("texto-grande", textoGrande);
        return () => document.documentElement.classList.remove("texto-grande");
    }, [textoGrande]);

    useEffect(() => { guardarEstado({ lista }); }, [lista]);
    useEffect(() => { guardarEstado({ plan }); }, [plan]);

    const agregarALista = items => setLista(l => sumarALista(l, items));

    function abrirHerramienta(v) { setMenu(false); setHerramienta(v); }
    function abrirDesdeHerramienta(id) { setHerramienta(null); setAbierta(id); }

    function alternarTextoGrande() {
        const nuevo = !textoGrande;
        setTextoGrande(nuevo);
        guardarEstado({ grande: nuevo });
    }

    function alternarFavorita(id) {
        const esta = favs.includes(id);
        const nuevos = esta ? favs.filter(x => x !== id) : [...favs, id];
        setFavs(nuevos);
        guardarEstado({ favs: nuevos });
        avisar(esta ? "Quitada de favoritos." : "Guardada en favoritos.");
    }

    const q = norm(busqueda.trim());
    const visibles = RECETAS.filter(r =>
        norm(r.titulo).includes(q) &&
        (filtro === "todas" || (filtro === "favoritas" ? favs.includes(r.id) : r.categoria === filtro)));

    const receta = abierta === null ? null : RECETAS[abierta];

    return (
        <div className="pagina-hlp">
            <a className="saltar" href="#recetas">Saltar al contenido</a>

            <header className={`encabezado ${sombra ? "con-sombra" : ""}`} id="inicio">
                <div className="encabezado__interior">
                    <a href="#inicio" className="logo">Healthy<span>Lab</span></a>

                    <nav className="nav" aria-label="Principal">
                        {[["inicio", "Inicio"], ["recetas", "Recetas"], ["contacto", "Contáctanos"]].map(([id, texto]) => (
                            <a key={id} href={`#${id}`} className={`nav__link ${seccion === id ? "activo" : ""}`}>{texto}</a>
                        ))}
                    </nav>

                    <div className="acciones">
                        {sesion?.rol === "admin" && <Link to="/admin" className="nav__link">Panel</Link>}
                        <button type="button" className="nav__link" title={sesion ? `Sesión de ${sesion.nombre}` : undefined} onClick={salir}>Salir</button>
                        <BotonTema className="btn-icono" />
                        <button
                            ref={botonMenu}
                            className="btn-icono hamburguesa"
                            type="button"
                            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
                            aria-expanded={menu}
                            aria-controls="cajon"
                            onClick={() => setMenu(m => !m)}
                        >
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="presentacion">
                    <div className="presentacion__texto">
                        <h1>Porque cuidar de tu salud no debe ser una ciencia</h1>
                        <p>Recetas nutritivas para comer bien sin complicarte.</p>
                        <div className="presentacion__botones">
                            <a href="#recetas" className="boton">Ver recetas</a>
                            <a href="#contacto" className="boton boton--suave">Escríbenos</a>
                        </div>
                    </div>
                    <div className="presentacion__fotos" aria-hidden="true">
                        <img src="/resources/imgs/salmon.jpg" alt="" className="foto-a" />
                        <img src="/resources/imgs/ensaladaquinoa.jpg" alt="" className="foto-b" />
                    </div>
                </section>

                <section id="recetas" className="seccion">
                    <div className="seccion__cabecera">
                        <h2>Recetas</h2>
                        <p className="contador" aria-live="polite">{visibles.length === 1 ? "1 receta" : `${visibles.length} recetas`}</p>
                    </div>

                    <div className="herramientas">
                        <label className="buscador">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                            <input type="search" placeholder="Buscar una receta" aria-label="Buscar una receta" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                        </label>
                        <div className="filtros" role="group" aria-label="Filtrar por tipo de comida">
                            {FILTROS.map(([valor, texto]) => (
                                <button key={valor} type="button" className={`filtro ${filtro === valor ? "activo" : ""}`} onClick={() => setFiltro(valor)}>{texto}</button>
                            ))}
                        </div>
                    </div>

                    <div className="rejilla">
                        {visibles.map(r => (
                            <RecetaCard
                                key={`${filtro}|${busqueda}|${r.id}`}
                                receta={r}
                                favorita={favs.includes(r.id)}
                                onAbrir={() => setAbierta(r.id)}
                                onFavorita={() => alternarFavorita(r.id)}
                            />
                        ))}
                    </div>

                    {visibles.length === 0 && (
                        <p className="vacio">
                            {filtro === "favoritas" && !q
                                ? "Aún no tienes favoritas. Toca el corazón de una receta para guardarla."
                                : "No encontramos recetas con esa búsqueda. Prueba con otra palabra o cambia el filtro."}
                        </p>
                    )}
                </section>

                <section id="contacto" className="seccion contacto">
                    <div className="contacto__texto">
                        <h2>Contáctanos</h2>
                        <p>¿Tienes una duda, una idea o quieres sugerirnos una receta? Escríbenos y te respondemos pronto.</p>
                    </div>
                    <FormularioContacto avisar={avisar} />
                </section>
            </main>

            <footer className="pie">
                <p className="logo logo--pie">Healthy<span>Lab</span></p>
                <p>© 2026 HealthyLab. Todos los derechos reservados.</p>
            </footer>

            <button className={`subir ${verSubir ? "visible" : ""}`} type="button" aria-label="Volver arriba" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg>
            </button>

            <Cajon
                abierto={menu}
                onCerrar={() => setMenu(false)}
                textoGrande={textoGrande}
                onTextoGrande={alternarTextoGrande}
                volverA={botonMenu}
            >
                <p className="cajon__tit">Cocina</p>
                {HERRAMIENTAS.map(([v, t, d]) => (
                    <button key={v} className="cajon__item" type="button" onClick={() => abrirHerramienta(v)}>{t}<small>{d}</small></button>
                ))}
                <button className="cajon__item" type="button" onClick={() => abrirHerramienta("lista")}>
                    Lista de compras{pendientes(lista) > 0 && <span className="badge">{pendientes(lista)}</span>}
                    <small>Ingredientes que te faltan</small>
                </button>
                <button className="cajon__item" type="button" onClick={() => abrirHerramienta("favoritos")}>
                    Favoritos{favs.length > 0 && <span className="badge">{favs.length}</span>}
                    <small>Tus recetas guardadas</small>
                </button>
            </Cajon>

            {receta && (
                <RecetaModal
                    key={receta.id}
                    receta={receta}
                    favorita={favs.includes(receta.id)}
                    onFavorita={() => alternarFavorita(receta.id)}
                    onCocina={() => { setAbierta(null); setCocina(receta.id); }}
                    onAgregarALista={agregarALista}
                    onCerrar={() => setAbierta(null)}
                    aviso={aviso}
                    avisar={avisar}
                />
            )}

            {herramienta && (
                <Herramientas
                    key={herramienta}
                    vista={herramienta}
                    onCerrar={() => setHerramienta(null)}
                    aviso={aviso}
                    avisar={avisar}
                    lista={lista}
                    onLista={setLista}
                    plan={plan}
                    onPlan={setPlan}
                    favs={favs}
                    onAbrirReceta={abrirDesdeHerramienta}
                    onAgregarALista={agregarALista}
                />
            )}

            {cocina !== null && (
                <ModoCocina key={cocina} receta={RECETAS[cocina]} onSalir={() => setCocina(null)} aviso={aviso} avisar={avisar} />
            )}

            {!receta && !herramienta && cocina === null && <Aviso aviso={aviso} />}
        </div>
    );
}
