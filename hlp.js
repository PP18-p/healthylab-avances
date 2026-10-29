"use strict";

/* ===== ACCESO: esta página exige sesión (cualquier rol) ===== */
if (!HL.sesion()) { location.replace("login.html"); throw new Error("Sesión requerida"); }
document.body.hidden = false;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const norm = t => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ===== ESTADO (se guarda en el navegador con localStorage) ===== */
const E = { favs: [], lista: [], plan: {}, resenas: {}, grande: false };
try { Object.assign(E, JSON.parse(localStorage.getItem("hl") || "{}")); } catch (e) { }
const guardar = () => { try { localStorage.setItem("hl", JSON.stringify(E)); } catch (e) { } };

/* ===== DATOS DE LAS RECETAS (mismo orden que en el HTML) =====
   R(porciones, minutos, [kcal, proteína, carbohidratos, grasas], "ingrediente|cantidad|unidad;...", "paso@minutos;...") */
const R = (porc, min, n, ing, pasos) => ({
    porc, min, n,
    ing: ing.split(";").map(s => { const [nombre, cant, uni] = s.split("|"); return { nombre, cant: +cant, uni: uni || "" }; }),
    pasos: pasos.split(";").map(s => { const [t, m] = s.split("@"); return { t, m: +m || 0 }; })
});

const D = [
    R(2, 20, [320, 32, 14, 14], "pechuga de pollo|300|g;lechuga|1|;tomate|2|;pepino|1|;aceite de oliva|2|cda;limón|1|", "Cocina el pollo a la plancha con sal y pimienta@10;Deja reposar el pollo y córtalo en tiras@3;Pica las verduras y mézclalas en un bol;Agrega el pollo, el aceite y el jugo de limón y sirve"),
    R(2, 10, [290, 9, 48, 7], "avena en hojuelas|80|g;leche|400|ml;plátano|1|;fresas|100|g;miel|1|cda", "Calienta la leche con la avena a fuego medio@6;Revuelve hasta que espese;Sirve y corona con la fruta picada y la miel"),
    R(2, 5, [180, 6, 36, 2], "plátano|2|;fresas|150|g;yogur natural|200|g;leche|200|ml", "Pon todos los ingredientes en la licuadora;Licúa hasta que quede cremoso@1;Sirve bien frío"),
    R(2, 15, [210, 6, 22, 11], "brócoli|200|g;zanahoria|2|;pimiento|1|;ajo|2|diente;salsa de soja|2|cda;aceite de oliva|1|cda", "Corta las verduras en tiras;Saltea el ajo en el aceite@1;Añade las verduras y cocina a fuego alto@7;Agrega la salsa de soja y mezcla@1"),
    R(4, 40, [450, 30, 55, 10], "arroz|300|g;pechuga de pollo|400|g;zanahoria|2|;arvejas|100|g;cebolla|1|;caldo de pollo|600|ml", "Dora el pollo en cubos con la cebolla@8;Añade el arroz, las verduras y el caldo;Tapa y cocina a fuego bajo@20;Deja reposar tapado@5"),
    R(2, 15, [240, 15, 8, 16], "huevos|4|;espinaca|100|g;cebolla|0.5|;tomate|1|;aceite de oliva|1|cda", "Saltea la cebolla y la espinaca@4;Bate los huevos con sal y viértelos en la sartén;Cocina a fuego bajo por un lado@4;Voltea la tortilla y cocina el otro lado@2"),
    R(1, 5, [210, 10, 32, 5], "yogur natural|200|g;frutas picadas|100|g;granola|30|g;miel|1|cdta", "Sirve el yogur en un vaso;Agrega la fruta y la granola;Termina con un hilo de miel"),
    R(2, 30, [280, 34, 6, 13], "filete de pescado blanco|400|g;limón|1|;ajo|2|diente;aceite de oliva|1|cda;perejil|1|cda", "Precalienta el horno a 200 °C@10;Coloca el pescado en una bandeja con ajo, limón, aceite y sal;Hornea hasta que se desmenuce fácil@15;Sirve con perejil picado"),
    R(2, 25, [340, 12, 48, 11], "quinoa|150|g;tomate|2|;pepino|1|;aguacate|1|;limón|1|", "Enjuaga bien la quinoa;Cocínala en el doble de agua@15;Deja enfriar@5;Mezcla con las verduras picadas y el jugo de limón"),
    R(2, 20, [310, 12, 40, 10], "avena en hojuelas|100|g;huevos|2|;plátano|1|;leche|100|ml;miel|1|cdta", "Licúa todos los ingredientes;Calienta una sartén antiadherente;Cocina cada panqueque 2 minutos por lado@4;Sirve con fruta"),
    R(4, 35, [150, 5, 24, 4], "zanahoria|2|;papa|2|;apio|2|tallo;cebolla|1|;calabacín|1|;caldo de verduras|1000|ml", "Pica todas las verduras;Sofríe la cebolla y el apio@5;Agrega el caldo y el resto de verduras;Hierve a fuego medio@20;Ajusta la sal y sirve caliente"),
    R(2, 15, [380, 28, 35, 13], "tortillas integrales|2|;pechuga de pollo|200|g;lechuga|4|hoja;tomate|1|;yogur natural|2|cda", "Cocina el pollo a la plancha@8;Córtalo en tiras;Unta yogur sobre la tortilla y rellena con el pollo y las verduras;Enrolla y sirve"),
    R(1, 10, [260, 19, 5, 18], "huevos|3|;espinaca|50|g;tomate|0.5|;queso fresco|30|g", "Bate los huevos con una pizca de sal;Cocina en la sartén a fuego medio@3;Agrega el relleno y dobla el omelette@2"),
    R(2, 25, [420, 35, 12, 26], "filete de salmón|300|g;brócoli|200|g;zanahoria|1|;aceite de oliva|1|cda;limón|1|", "Precalienta el horno a 190 °C@10;Coloca el salmón y las verduras en una bandeja con aceite y sal;Hornea@15;Sirve con limón"),
    R(2, 10, [160, 2, 40, 1], "manzana|1|;naranja|1|;fresas|100|g;uvas|100|g;miel|1|cdta", "Lava y corta toda la fruta;Mézclala en un bol con la miel y el jugo de la naranja;Refrigera antes de servir@10"),
    R(2, 25, [390, 30, 30, 16], "carne molida magra|300|g;avena en hojuelas|2|cda;cebolla|0.5|;pan integral|2|;lechuga|2|hoja;tomate|1|", "Mezcla la carne con la avena, la cebolla, sal y pimienta;Forma dos hamburguesas;Cocínalas a la plancha@10;Arma con el pan, la lechuga y el tomate")
];

/* Sustituciones de ingredientes */
const SUST = {
    "pechuga de pollo": "pavo, tofu firme o garbanzos", "leche": "bebida de avena, almendra o soja",
    "yogur natural": "yogur vegetal sin azúcar o queso fresco batido", "miel": "sirope de agave o dátiles triturados",
    "huevos": "tofu revuelto, o 1 cda de linaza molida con 3 cdas de agua por huevo", "arroz": "quinoa o arroz integral",
    "carne molida": "lentejas cocidas o pavo molido", "salmón": "trucha o atún fresco", "pescado": "otro pescado blanco o pollo",
    "aceite de oliva": "aceite de aguacate o de canola", "salsa de soja": "tamari o aminos de coco",
    "avena": "copos de quinoa o salvado de trigo", "queso fresco": "tofu o requesón", "tortillas": "hojas grandes de lechuga",
    "quinoa": "cuscús integral o arroz integral", "mantequilla": "aceite de oliva"
};
const sustituto = nombre => { const k = Object.keys(SUST).find(k => norm(nombre).includes(norm(k))); return k ? SUST[k] : ""; };

/* ===== UTILIDADES ===== */
const num = n => String(Math.round(n * 10) / 10).replace(".", ",");
const fmtIng = (i, cant = i.cant) => {
    const uni = i.uni ? (cant > 1 && /^(diente|hoja|tallo)$/.test(i.uni) ? i.uni + "s" : i.uni) + " de " : "";
    return `${num(cant)} ${uni}${i.nombre}`;
};

let tAviso;
function aviso(msg) {
    const a = $("#aviso");
    a.textContent = msg;
    a.classList.add("visible");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => a.classList.remove("visible"), 3500);
}

/* Voz del navegador */
function hablar(texto, alTerminar) {
    if (!("speechSynthesis" in window)) { aviso("Tu navegador no admite lectura en voz alta."); return false; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-ES";
    u.onend = alTerminar || null;
    speechSynthesis.speak(u);
    return true;
}
const callar = () => "speechSynthesis" in window && speechSynthesis.cancel();

/* ===== MODO OSCURO ===== */
(function () {
    const raiz = document.documentElement, boton = $("#modo-oscuro");
    let guardado = null;
    try { guardado = localStorage.getItem("tema"); } catch (e) { }
    const aplicar = t => { raiz.dataset.tema = t; boton.setAttribute("aria-label", t === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"); };
    aplicar(guardado || (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro"));
    boton.addEventListener("click", () => {
        const n = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
        aplicar(n);
        try { localStorage.setItem("tema", n); } catch (e) { }
    });
})();

/* ===== MENÚ LATERAL (tres líneas) ===== */
const cajon = $("#cajon"), velo = $("#velo"), hamb = $("#hamburguesa");
function menu(abrir) {
    cajon.classList.toggle("abierto", abrir);
    cajon.inert = !abrir;
    velo.hidden = !abrir;
    hamb.setAttribute("aria-expanded", abrir);
    hamb.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = abrir ? "hidden" : "";
    if (abrir) $("#cajon-cerrar").focus(); else hamb.focus({ preventScroll: true });
}
hamb.addEventListener("click", () => menu(!cajon.classList.contains("abierto")));
$("#cajon-cerrar").addEventListener("click", () => menu(false));
velo.addEventListener("click", () => menu(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && cajon.classList.contains("abierto")) menu(false); });
$$(".cajon__nav a").forEach(a => a.addEventListener("click", () => menu(false)));

/* Texto ampliado */
const bGrande = $("#t-grande");
function textoGrande(on) {
    document.documentElement.classList.toggle("texto-grande", on);
    bGrande.setAttribute("aria-pressed", on);
    E.grande = on; guardar();
}
bGrande.addEventListener("click", () => textoGrande(!E.grande));
textoGrande(!!E.grande);

/* ===== ENCABEZADO, LINK ACTIVO Y BOTÓN SUBIR ===== */
(function () {
    const enc = $(".encabezado"), subir = $("#subir");
    addEventListener("scroll", () => {
        enc.classList.toggle("con-sombra", scrollY > 10);
        subir.classList.toggle("visible", scrollY > 600);
    }, { passive: true });
    subir.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
    const enlaces = $$(".nav__link");
    const obs = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) enlaces.forEach(a => a.classList.toggle("activo", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    ["inicio", "recetas", "contacto"].forEach(id => obs.observe(document.getElementById(id)));
})();

/* ===== TARJETAS: BÚSQUEDA, FILTROS Y FAVORITOS ===== */
const tarjetas = $$(".receta");
const titulos = tarjetas.map(t => $("h3", t).textContent);
const categorias = tarjetas.map(t => t.dataset.cat);
const buscador = $("#buscador"), contador = $("#contador"), vacio = $("#vacio");
let filtroActual = "todas";

const CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>';

tarjetas.forEach((t, id) => {
    t.insertAdjacentHTML("beforeend", `<button class="corazon" type="button" aria-pressed="false">${CORAZON}</button>`);
    t.tabIndex = 0;
    t.setAttribute("role", "button");
    t.setAttribute("aria-label", "Ver receta: " + titulos[id]);
    t.addEventListener("click", e => { if (e.target.closest(".corazon")) alternarFav(id); else abrirReceta(id); });
    t.addEventListener("keydown", e => { if (e.key === "Enter" && e.target === t) abrirReceta(id); });
    const img = $("img", t);
    img.addEventListener("error", () => { const f = img.parentElement; f.classList.add("sin-imagen"); f.textContent = "Foto no disponible"; });
});

function pintarFavs() {
    tarjetas.forEach((t, id) => {
        const on = E.favs.includes(id), b = $(".corazon", t);
        b.setAttribute("aria-pressed", on);
        b.setAttribute("aria-label", (on ? "Quitar de favoritos: " : "Guardar en favoritos: ") + titulos[id]);
    });
    $("#b-favs").textContent = E.favs.length;
}
function alternarFav(id) {
    const i = E.favs.indexOf(id);
    if (i >= 0) E.favs.splice(i, 1); else E.favs.push(id);
    guardar(); pintarFavs();
    if (filtroActual === "favoritas") filtrar();
    aviso(i >= 0 ? "Quitada de favoritos." : "Guardada en favoritos.");
}

function filtrar() {
    const q = norm(buscador.value.trim());
    let n = 0;
    tarjetas.forEach((t, id) => {
        const ok = norm(titulos[id]).includes(q) &&
            (filtroActual === "todas" || (filtroActual === "favoritas" ? E.favs.includes(id) : categorias[id] === filtroActual));
        t.hidden = !ok;
        if (ok) { n++; t.classList.remove("entra"); void t.offsetWidth; t.classList.add("entra"); }
    });
    contador.textContent = n === 1 ? "1 receta" : n + " recetas";
    vacio.hidden = n !== 0;
    vacio.textContent = filtroActual === "favoritas" && !q ? "Aún no tienes favoritas. Toca el corazón de una receta para guardarla." : "No encontramos recetas con esa búsqueda. Prueba con otra palabra o cambia el filtro.";
}
$$(".filtro").forEach(b => b.addEventListener("click", () => {
    $$(".filtro").forEach(x => x.classList.remove("activo"));
    b.classList.add("activo");
    filtroActual = b.dataset.filtro;
    filtrar();
}));
buscador.addEventListener("input", filtrar);

/* ===== LISTA DE COMPRAS ===== */
function agregarALista(ings) {
    ings.forEach(i => {
        const ex = E.lista.find(x => x.nombre === i.nombre && x.uni === i.uni);
        if (ex) { ex.cant += i.cant; ex.ok = false; } else E.lista.push({ nombre: i.nombre, uni: i.uni, cant: i.cant, ok: false });
    });
    guardar(); badges();
}
function badges() { $("#b-lista").textContent = E.lista.filter(x => !x.ok).length; $("#b-favs").textContent = E.favs.length; }

/* ===== RECETA (modal) ===== */
const dlgReceta = $("#receta-dlg"), contReceta = $("#receta-cont");

function abrirReceta(id) {
    const r = D[id], titulo = titulos[id];
    const src = $("img", tarjetas[id]).getAttribute("src");
    let porc = r.porc, estrellas = 0;

    contReceta.innerHTML = `
        <button class="cerrar" type="button" data-cerrar aria-label="Cerrar">✕</button>
        <div class="rm__media">${r.video ? `<video src="${esc(r.video)}" poster="${esc(src)}" controls></video>` : `<img src="${esc(src)}" alt="${esc(titulo)}">`}</div>
        <div class="rm__cuerpo">
            <h2>${esc(titulo)}</h2>
            <div class="rm__meta"><span>${r.min} minutos</span><span>${esc(categorias[id])}</span><span id="m-prom"></span></div>
            <div class="rm__acciones">
                <button class="mini mini--p" type="button" data-a="cocina">Modo cocina</button>
                <button class="mini" type="button" data-a="voz" aria-pressed="false">Escuchar receta</button>
                <button class="mini" type="button" data-a="fav" aria-pressed="false"></button>
                <button class="mini" type="button" data-a="lista">Agregar a la lista</button>
            </div>
            <h3>Ingredientes</h3>
            <div class="porciones"><button type="button" data-p="-1" aria-label="Menos porciones">−</button><span id="m-porc" aria-live="polite"></span><button type="button" data-p="1" aria-label="Más porciones">+</button></div>
            <ul id="m-ing"></ul>
            <h3>Información nutricional por porción</h3>
            <dl class="nut">
                <div><dt>Calorías</dt><dd>${r.n[0]} kcal</dd></div><div><dt>Proteínas</dt><dd>${r.n[1]} g</dd></div>
                <div><dt>Carbohidratos</dt><dd>${r.n[2]} g</dd></div><div><dt>Grasas</dt><dd>${r.n[3]} g</dd></div>
            </dl>
            <p class="nut-nota">Valores aproximados. Pueden variar según las marcas y las cantidades que uses.</p>
            <h3>Preparación</h3>
            <ol>${r.pasos.map(p => `<li>${esc(p.t)}${p.m ? ` (${p.m} min)` : ""}</li>`).join("")}</ol>
            <h3>Valoraciones y comentarios</h3>
            <div id="m-res"></div>
            <div class="resena-form">
                <div class="estrellas" id="m-est" role="group" aria-label="Tu valoración">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-v="${v}" aria-label="${v} de 5">★</button>`).join("")}</div>
                <input type="text" id="m-nom" placeholder="Tu nombre" maxlength="40" autocomplete="name">
                <textarea id="m-txt" placeholder="¿Qué te pareció la receta?" maxlength="300"></textarea>
                <button class="mini mini--p" type="button" data-a="resena">Publicar valoración</button>
            </div>
        </div>`;

    const pintarIng = () => {
        const f = porc / r.porc;
        $("#m-porc").textContent = porc + (porc === 1 ? " porción" : " porciones");
        $("#m-ing").innerHTML = r.ing.map((i, k) => {
            const s = sustituto(i.nombre);
            return `<li><span>${esc(fmtIng(i, i.cant * f))}</span>${s ? `<button class="sust" type="button" data-s="${k}">Sustituir</button><span class="sust-txt" hidden>Puedes usar: ${esc(s)}.</span>` : ""}</li>`;
        }).join("");
    };
    const pintarFav = () => {
        const b = $('[data-a="fav"]', contReceta), on = E.favs.includes(id);
        b.setAttribute("aria-pressed", on);
        b.textContent = on ? "En favoritos" : "Guardar en favoritos";
    };
    const pintarRes = () => {
        const l = E.resenas[id] || [];
        $("#m-prom").textContent = l.length ? `★ ${num(l.reduce((a, x) => a + x.e, 0) / l.length)} (${l.length})` : "Sin valoraciones";
        $("#m-res").innerHTML = l.length ? l.slice().reverse().map(x => `<div class="resena"><b>${esc(x.n)}</b><span class="est">${"★".repeat(x.e)}</span><p>${esc(x.t)}</p></div>`).join("") : '<p class="vacio" style="padding:8px 0">Sé la primera persona en valorar esta receta.</p>';
    };
    const pintarEst = () => $$("#m-est button", contReceta).forEach(b => b.classList.toggle("on", +b.dataset.v <= estrellas));
    pintarIng(); pintarFav(); pintarRes();

    contReceta.onclick = e => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.cerrar !== undefined) return dlgReceta.close();
        if (b.dataset.p) { porc = Math.min(20, Math.max(1, porc + +b.dataset.p)); return pintarIng(); }
        if (b.dataset.s) { const t = b.nextElementSibling; t.hidden = !t.hidden; b.textContent = t.hidden ? "Sustituir" : "Ocultar"; return; }
        if (b.dataset.v) { estrellas = +b.dataset.v; return pintarEst(); }
        switch (b.dataset.a) {
            case "cocina": dlgReceta.close(); modoCocina(id); break;
            case "fav": alternarFav(id); pintarFav(); break;
            case "lista": { const f = porc / r.porc; agregarALista(r.ing.map(i => ({ ...i, cant: i.cant * f }))); aviso("Ingredientes agregados a tu lista."); break; }
            case "voz": {
                const on = b.getAttribute("aria-pressed") === "true";
                if (on) { callar(); b.setAttribute("aria-pressed", false); b.textContent = "Escuchar receta"; break; }
                const f = porc / r.porc;
                const txt = `${titulo}. Ingredientes: ${r.ing.map(i => fmtIng(i, i.cant * f)).join(", ")}. Preparación: ${r.pasos.map((p, k) => `Paso ${k + 1}. ${p.t}.`).join(" ")}`;
                const fin = () => { b.setAttribute("aria-pressed", false); b.textContent = "Escuchar receta"; };
                if (hablar(txt, fin)) { b.setAttribute("aria-pressed", true); b.textContent = "Detener lectura"; }
                break;
            }
            case "resena": {
                const nom = $("#m-nom").value.trim(), txt = $("#m-txt").value.trim();
                if (!estrellas) return aviso("Elige de 1 a 5 estrellas.");
                if (txt.length < 5) return aviso("Escribe un comentario de al menos 5 caracteres.");
                /* f = fecha de publicación (la usa el panel de administración) */
                (E.resenas[id] = E.resenas[id] || []).push({ n: nom || "Anónimo", e: estrellas, t: txt, f: Date.now() });
                guardar(); estrellas = 0; pintarEst(); pintarRes();
                $("#m-nom").value = ""; $("#m-txt").value = "";
                aviso("Gracias por tu valoración.");
            }
        }
    };
    dlgReceta.showModal();
    dlgReceta.scrollTop = 0;
}
dlgReceta.addEventListener("close", callar);

/* ===== MODO COCINA ===== */
const dlgCocina = $("#cocina");
let cPaso = 0, cId = 0, cTimer = null, cRestante = 0, wl = null;

async function pantallaActiva(on) {
    try {
        if (on && "wakeLock" in navigator) wl = await navigator.wakeLock.request("screen");
        else if (wl) { await wl.release(); wl = null; }
    } catch (e) { }
}
function pitar() {
    try {
        const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator();
        o.connect(a.destination); o.frequency.value = 880; o.start();
        setTimeout(() => { o.stop(); a.close(); }, 800);
    } catch (e) { }
}
const reloj = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

function pintarPaso() {
    const r = D[cId], p = r.pasos[cPaso];
    clearInterval(cTimer); cTimer = null; callar();
    $("#c-info").textContent = `Paso ${cPaso + 1} de ${r.pasos.length}`;
    $("#c-paso").textContent = p.t;
    $("#c-barra").style.width = ((cPaso + 1) / r.pasos.length * 100) + "%";
    $("#c-ant").disabled = cPaso === 0;
    $("#c-sig").textContent = cPaso === r.pasos.length - 1 ? "Terminar" : "Siguiente";
    cRestante = p.m * 60;
    $("#c-reloj").textContent = p.m ? reloj(cRestante) : "";
    const bi = $("#c-iniciar");
    bi.hidden = !p.m; bi.textContent = "Iniciar temporizador";
}
function modoCocina(id) {
    cId = id; cPaso = 0;
    $("#c-titulo").textContent = titulos[id];
    pintarPaso();
    dlgCocina.showModal();
    pantallaActiva(true);
}
$("#c-ant").addEventListener("click", () => { if (cPaso > 0) { cPaso--; pintarPaso(); } });
$("#c-sig").addEventListener("click", () => {
    if (cPaso < D[cId].pasos.length - 1) { cPaso++; pintarPaso(); }
    else { dlgCocina.close(); aviso("¡Buen provecho!"); }
});
$("#c-salir").addEventListener("click", () => dlgCocina.close());
$("#c-leer").addEventListener("click", () => hablar(D[cId].pasos[cPaso].t));
$("#c-iniciar").addEventListener("click", e => {
    if (cTimer) { clearInterval(cTimer); cTimer = null; e.target.textContent = "Reanudar"; return; }
    e.target.textContent = "Pausar";
    cTimer = setInterval(() => {
        cRestante--;
        $("#c-reloj").textContent = reloj(Math.max(cRestante, 0));
        if (cRestante <= 0) {
            clearInterval(cTimer); cTimer = null; pitar();
            aviso("¡Tiempo cumplido!"); e.target.textContent = "Reiniciar";
            cRestante = D[cId].pasos[cPaso].m * 60;
        }
    }, 1000);
});
dlgCocina.addEventListener("close", () => { clearInterval(cTimer); cTimer = null; callar(); pantallaActiva(false); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && dlgCocina.open) pantallaActiva(true); });

/* ===== HERRAMIENTAS DEL MENÚ ===== */
const dlgHerr = $("#herr-dlg"), contHerr = $("#herr-cont");
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const COMIDAS = [["Desayuno", "desayuno"], ["Almuerzo", "almuerzo"], ["Cena", "cena"]];
const BASICOS = /aceite|\bsal\b|miel|salsa/;

const vistas = {
    lista() {
        const l = E.lista;
        return `<h2>Lista de compras</h2>` + (!l.length ? '<p class="vacio" style="padding:8px 0">Tu lista está vacía. Abre una receta y pulsa «Agregar a la lista».</p>' :
            `<ul class="lista">${l.map((x, i) => `<li class="${x.ok ? "hecho" : ""}"><label><input type="checkbox" data-i="${i}" ${x.ok ? "checked" : ""}> ${esc(fmtIng(x))}</label><button type="button" data-del="${i}" aria-label="Quitar ${esc(x.nombre)}">✕</button></li>`).join("")}</ul>
            <div class="fila"><button class="mini" type="button" data-acc="copiar">Copiar lista</button><button class="mini" type="button" data-acc="quitar-ok">Quitar marcados</button><button class="mini" type="button" data-acc="vaciar">Vaciar lista</button></div>`);
    },
    favoritos() {
        return `<h2>Favoritos</h2>` + (!E.favs.length ? '<p class="vacio" style="padding:8px 0">Aún no tienes recetas guardadas. Toca el corazón de una receta.</p>' :
            E.favs.map(id => `<button class="resultado" type="button" data-abrir="${id}"><span>${esc(titulos[id])}<small>${D[id].min} minutos, ${esc(categorias[id])}</small></span></button>`).join(""));
    },
    plan() {
        const opt = c => `<option value="">Sin elegir</option>` + titulos.map((t, id) => categorias[id] === c ? `<option value="${id}">${esc(t)}</option>` : "").join("");
        return `<h2>Planificador semanal</h2><div class="plan-wrap"><table class="plan"><thead><tr><th></th>${COMIDAS.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>
            ${DIAS.map((d, i) => `<tr><th scope="row">${d}</th>${COMIDAS.map((c, j) => { const k = i + "-" + j, v = E.plan[k] ?? ""; return `<td><select data-k="${k}" aria-label="${d}, ${c[0]}">${opt(c[1]).replace(`value="${v}"`, `value="${v}" selected`)}</select></td>`; }).join("")}</tr>`).join("")}
            </tbody></table></div>
            <div class="fila"><button class="mini mini--p" type="button" data-acc="plan-lista">Agregar el menú a la lista de compras</button><button class="mini" type="button" data-acc="plan-limpiar">Limpiar plan</button></div>`;
    },
    despensa() {
        return `<h2>¿Qué cocino hoy?</h2><div class="despensa"><label for="d-ing">Escribe los ingredientes que tienes, separados por comas</label>
            <textarea id="d-ing" placeholder="Ej: huevos, tomate, espinaca, avena"></textarea></div><div id="d-res" aria-live="polite"></div>`;
    }
};

function abrirHerr(nombre) {
    contHerr.dataset.v = nombre;
    contHerr.innerHTML = vistas[nombre]();
    if (!dlgHerr.open) dlgHerr.showModal();
}

function buscarPorIngredientes() {
    const tokens = $("#d-ing").value.split(/[,\n]+/).map(s => norm(s.trim())).filter(s => s.length > 1);
    const cont = $("#d-res");
    if (!tokens.length) { cont.innerHTML = ""; return; }
    const res = D.map((r, id) => {
        const ings = r.ing.filter(i => !BASICOS.test(norm(i.nombre)));
        const tiene = ings.filter(i => tokens.some(t => norm(i.nombre).includes(t) || t.includes(norm(i.nombre))));
        return { id, pct: Math.round(tiene.length / ings.length * 100), falta: ings.filter(i => !tiene.includes(i)).map(i => i.nombre) };
    }).filter(x => x.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 6);
    cont.innerHTML = res.length ? res.map(x => `<button class="resultado" type="button" data-abrir="${x.id}"><span>${esc(titulos[x.id])}<small>${x.falta.length ? "Te falta: " + esc(x.falta.join(", ")) : "Tienes todo lo necesario"}</small></span><strong>${x.pct}%</strong></button>`).join("") : '<p class="vacio" style="padding:12px 0">Ninguna receta coincide todavía. Prueba con otros ingredientes.</p>';
}

$$("[data-herr]").forEach(b => b.addEventListener("click", () => { menu(false); abrirHerr(b.dataset.herr); }));

dlgHerr.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.cerrar !== undefined) return dlgHerr.close();
    if (b.dataset.abrir) { dlgHerr.close(); return abrirReceta(+b.dataset.abrir); }
    if (b.dataset.del) { E.lista.splice(+b.dataset.del, 1); guardar(); badges(); return abrirHerr("lista"); }
    switch (b.dataset.acc) {
        case "copiar":
            navigator.clipboard?.writeText(E.lista.map(x => "- " + fmtIng(x)).join("\n")).then(() => aviso("Lista copiada."), () => aviso("No se pudo copiar."));
            break;
        case "quitar-ok": E.lista = E.lista.filter(x => !x.ok); guardar(); badges(); abrirHerr("lista"); break;
        case "vaciar": E.lista = []; guardar(); badges(); abrirHerr("lista"); break;
        case "plan-limpiar": E.plan = {}; guardar(); abrirHerr("plan"); break;
        case "plan-lista": {
            const ids = Object.values(E.plan).filter(v => v !== "");
            if (!ids.length) return aviso("Elige al menos una receta en el plan.");
            ids.forEach(id => agregarALista(D[+id].ing));
            aviso("Menú agregado a tu lista de compras.");
        }
    }
});
dlgHerr.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.i !== undefined) { E.lista[+t.dataset.i].ok = t.checked; guardar(); badges(); t.closest("li").classList.toggle("hecho", t.checked); }
    if (t.dataset.k) { if (t.value === "") delete E.plan[t.dataset.k]; else E.plan[t.dataset.k] = t.value; guardar(); }
});
dlgHerr.addEventListener("input", e => { if (e.target.id === "d-ing") buscarPorIngredientes(); });

/* Cerrar los diálogos al tocar fuera de ellos */
[dlgReceta, dlgHerr].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

pintarFavs(); badges(); filtrar();

/* ===== FORMULARIO DE CONTACTO ===== */
(function () {
    const form = $("#formulario");
    const campos = {
        nombre: { el: $("#nombre"), validar: v => !v.trim() ? "Escribe tu nombre." : v.trim().length < 3 ? "El nombre debe tener al menos 3 letras." : "" },
        correo: { el: $("#correo"), validar: v => !v.trim() ? "Escribe tu correo electrónico." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Ingresa un correo válido, por ejemplo nombre@correo.com." : "" },
        mensaje: { el: $("#mensaje"), validar: v => !v.trim() ? "Escribe tu mensaje." : v.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : "" }
    };
    function revisar(n) {
        const { el, validar } = campos[n], error = validar(el.value), c = el.closest(".campo");
        $("#error-" + n).textContent = error;
        c.classList.toggle("invalido", !!error);
        c.classList.toggle("valido", !error);
        el.setAttribute("aria-invalid", !!error);
        return !error;
    }
    Object.keys(campos).forEach(n => {
        const { el } = campos[n];
        el.addEventListener("blur", () => revisar(n));
        el.addEventListener("input", () => { if (el.closest(".campo").classList.contains("invalido")) revisar(n); });
    });
    const msg = $("#mensaje"), car = $("#caracteres");
    msg.addEventListener("input", () => { car.textContent = msg.value.length + " / " + msg.maxLength; });
    form.addEventListener("submit", e => {
        e.preventDefault();
        const ok = Object.keys(campos).map(revisar);
        if (ok.includes(false)) {
            Object.values(campos).find(c => c.el.closest(".campo").classList.contains("invalido")).el.focus();
            return aviso("Revisa los campos marcados.");
        }
        // Aquí iría el envío real (fetch a tu servidor o servicio de correo)
        form.reset();
        car.textContent = "0 / " + msg.maxLength;
        $$(".campo").forEach(c => c.classList.remove("valido", "invalido"));
        aviso("Mensaje enviado. Te responderemos pronto.");
    });
})();
