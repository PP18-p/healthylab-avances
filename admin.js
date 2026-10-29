"use strict";

/* ===== ACCESO: solo la sesión del administrador entra aquí ===== */
const SES = HL.sesion();
if (!SES || SES.rol !== "admin") { location.replace("login.html"); throw new Error("Acceso restringido"); }
document.body.hidden = false;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const DIA = 864e5;
const fFecha = t => t ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(t) : "Nunca";
const fDia = t => new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric" }).format(t);
const hace = t => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    return s < 60 ? `hace ${s} s` : s < 3600 ? `hace ${Math.floor(s / 60)} min` : s < 86400 ? `hace ${Math.floor(s / 3600)} h` : `hace ${Math.floor(s / 86400)} d`;
};
const inicioDia = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

// intro.html es el nombre antiguo de hlp.html: se agrupan para que el historial no se divida
const PAGS = { "index.html": "Inicio", "hlp.html": "Recetas", "intro.html": "Recetas", "login.html": "Ingreso y registro" };
const nombrePag = p => PAGS[p] || p;

/* ===== DATOS ===== */
const visitas = () => HL.LS.get("hl_visitas", []);
const conectados = () => Object.entries(HL.LS.get("hl_activos", {}))
    .filter(([, v]) => v.t > Date.now() - 45000).map(([sid, v]) => ({ sid, ...v })).sort((a, b) => b.t - a.t);
const unicos = a => new Set(a.map(e => e.v)).size;
const sesiones = a => new Set(a.map(e => e.s)).size;
const contar = (a, f) => {
    const m = {};
    a.forEach(e => { const k = f(e); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
};

/* ===== COMPONENTES ===== */
const kpi = (t, v, s, vivo) => `<div class="kpi"><span class="${vivo ? "vivo" : ""}">${esc(t)}</span><strong>${v}</strong><small>${esc(s)}</small></div>`;

function barras(items, densa) {
    const max = Math.max(1, ...items.map(i => i.v));
    return `<div class="barras ${densa ? "densa" : ""}" role="img" aria-label="Gráfico de barras">${items.map(i =>
        `<div class="barra" title="${esc(i.n)}: ${i.v}"><b>${i.v}</b><i style="--h:${Math.round(i.v / max * 120)}px"></i><small>${esc(i.l ?? i.n)}</small></div>`).join("")}</div>`;
}
function ranking(items, vacio) {
    if (!items.length) return `<p class="suave">${esc(vacio)}</p>`;
    const total = items.reduce((a, i) => a + i.v, 0), max = items[0].v;
    return `<ul class="rank">${items.map(i => `<li><div><span>${esc(i.n)}</span><b>${i.v} <small class="suave">(${Math.round(i.v / total * 100)}%)</small></b></div><span class="f"><i style="--w:${Math.round(i.v / max * 100)}%"></i></span></li>`).join("")}</ul>`;
}

/* ===== VENTANAS ===== */
const dlg = $("#dlg"), cont = $("#dlg-cont");
function modal(html) {
    cont.innerHTML = '<button class="cerrar" type="button" data-x aria-label="Cerrar">✕</button>' + html;
    if (!dlg.open) dlg.showModal();
}
dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-x]")) dlg.close(); });
function confirmar(titulo, msg, boton) {
    return new Promise(res => {
        modal(`<h2>${esc(titulo)}</h2><p class="suave">${esc(msg)}</p><div class="fila"><button class="mini mini--p" type="button" data-ok>${esc(boton)}</button><button class="mini" type="button" data-x>Cancelar</button></div>`);
        const cierre = () => res(false);
        dlg.addEventListener("close", cierre, { once: true });
        $("[data-ok]", cont).addEventListener("click", () => { dlg.removeEventListener("close", cierre); dlg.close(); res(true); });
    });
}

/* ===== RESUMEN ===== */
function pintarResumen() {
    const ev = visitas(), us = HL.usuarios(), h0 = inicioDia();
    const hoy = ev.filter(e => e.t >= h0), sem = ev.filter(e => e.t >= h0 - 6 * DIA);
    const activas = us.filter(u => u.estado === "activo").length;
    const nuevas7 = us.filter(u => u.creado >= h0 - 6 * DIA).length, nuevasHoy = us.filter(u => u.creado >= h0).length;
    const porV = {};
    ev.forEach(e => (porV[e.v] = porV[e.v] || new Set()).add(e.s));
    const vs = Object.values(porV), recurr = vs.length ? Math.round(vs.filter(s => s.size > 1).length / vs.length * 100) : 0;

    $("#r-kpis").innerHTML = [
        kpi("Conectados ahora", conectados().length, "activos en los últimos 45 s", true),
        kpi("Visitas hoy", hoy.length, `${unicos(hoy)} visitantes únicos`),
        kpi("Visitas en 7 días", sem.length, `${unicos(sem)} visitantes únicos`),
        kpi("Cuentas registradas", us.length, `${activas} activas, ${us.length - activas} suspendidas`),
        kpi("Cuentas nuevas", nuevas7, `en 7 días (${nuevasHoy} hoy)`),
        kpi("Visitantes recurrentes", recurr + "%", "han vuelto en otra sesión")
    ].join("");

    const dias = [];
    for (let i = 6; i >= 0; i--) {
        const d = h0 - i * DIA;
        dias.push({ n: fDia(d), v: ev.filter(e => e.t >= d && e.t < d + DIA).length });
    }
    $("#r-dias").innerHTML = barras(dias);
    $("#r-pags").innerHTML = ranking(contar(ev, e => nombrePag(e.p)).slice(0, 5), "Todavía no hay visitas registradas.");
    $("#r-disp").innerHTML = ranking(contar(ev, e => e.d), "Todavía no hay visitas registradas.");

    const act = [];
    us.forEach(u => {
        act.push({ t: u.creado, x: `Nueva cuenta: ${u.nombre}` });
        if (u.ultimo) act.push({ t: u.ultimo, x: `Inicio de sesión: ${u.nombre}` });
    });
    act.sort((a, b) => b.t - a.t);
    $("#r-act").innerHTML = act.length
        ? `<ul class="feed">${act.slice(0, 8).map(a => `<li><span>${esc(a.x)}</span><small>${hace(a.t)}</small></li>`).join("")}</ul>`
        : '<p class="suave">Cuando alguien cree una cuenta o inicie sesión, aparecerá aquí.</p>';
}

/* ===== CUENTAS ===== */
let fEstado = "todas", busqueda = "";
function pintarCuentas() {
    const us = HL.usuarios().slice().sort((a, b) => b.creado - a.creado);
    const lista = us.filter(u => (fEstado === "todas" || u.estado === fEstado) && norm(u.nombre + " " + u.correo).includes(norm(busqueda.trim())));
    $("#c-cont").textContent = us.length === 1 ? "1 cuenta" : us.length + " cuentas";
    $("#c-cuerpo").innerHTML = lista.map(u => `<tr>
        <td><button class="nom" type="button" data-act="ver" data-id="${esc(u.id)}">${esc(u.nombre)}</button></td>
        <td>${esc(u.correo)}</td><td>${fFecha(u.creado)}</td><td>${fFecha(u.ultimo)}</td>
        <td><span class="estado estado--${esc(u.estado)}">${u.estado === "activo" ? "Activa" : "Suspendida"}</span></td>
        <td><div class="acc">
            <button class="mini" type="button" data-act="estado" data-id="${esc(u.id)}">${u.estado === "activo" ? "Suspender" : "Activar"}</button>
            <button class="mini" type="button" data-act="clave" data-id="${esc(u.id)}">Nueva clave</button>
            <button class="mini mini--peligro" type="button" data-act="borrar" data-id="${esc(u.id)}">Eliminar</button>
        </div></td></tr>`).join("");
    const v = $("#c-vacio");
    v.hidden = lista.length > 0;
    v.textContent = us.length ? "Ninguna cuenta coincide con la búsqueda." : "Aún no hay cuentas. Aparecerán aquí cuando alguien se registre en la página.";
}

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const claveTemporal = () => [...HL.bytes(12)].map(b => ALFABETO[b % ALFABETO.length]).join("");

$("#c-cuerpo").addEventListener("click", async e => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const lista = HL.usuarios(), u = lista.find(x => x.id === b.dataset.id);
    if (!u) return;
    switch (b.dataset.act) {
        case "ver":
            modal(`<h2>${esc(u.nombre)}</h2><dl>
                <dt>Correo</dt><dd>${esc(u.correo)}</dd>
                <dt>Estado</dt><dd>${u.estado === "activo" ? "Activa" : "Suspendida"}</dd>
                <dt>Creada</dt><dd>${fFecha(u.creado)}</dd>
                <dt>Último acceso</dt><dd>${fFecha(u.ultimo)}</dd>
                <dt>Inicios de sesión</dt><dd>${u.accesos || 0}</dd></dl>`);
            break;
        case "estado":
            u.estado = u.estado === "activo" ? "suspendido" : "activo";
            HL.guardarUsuarios(lista);
            HL.aviso(u.estado === "activo" ? "Cuenta activada." : "Cuenta suspendida.");
            pintarCuentas();
            break;
        case "clave": {
            if (!await confirmar("Restablecer contraseña", `Se generará una contraseña temporal para ${u.nombre}. La anterior dejará de funcionar.`, "Generar")) return;
            const t = claveTemporal();
            u.sal = HL.rnd(12); u.hash = HL.sha256(u.sal + t);
            HL.guardarUsuarios(lista);
            modal(`<h2>Contraseña temporal</h2><p class="suave">Compártela con ${esc(u.nombre)}. No volverá a mostrarse.</p><div class="clave-temp">${esc(t)}</div><div class="fila"><button class="mini mini--p" type="button" data-copiar="${esc(t)}">Copiar</button><button class="mini" type="button" data-x>Cerrar</button></div>`);
            break;
        }
        case "borrar":
            if (!await confirmar("Eliminar cuenta", `Se eliminará la cuenta de ${u.nombre} (${u.correo}). Esta acción no se puede deshacer.`, "Eliminar")) return;
            HL.guardarUsuarios(lista.filter(x => x.id !== u.id));
            HL.aviso("Cuenta eliminada.");
            pintarCuentas();
    }
});

cont.addEventListener("click", e => {
    const c = e.target.closest("[data-copiar]");
    if (c) navigator.clipboard?.writeText(c.dataset.copiar).then(() => HL.aviso("Copiada."), () => HL.aviso("No se pudo copiar."));
    const g = e.target.closest("[data-gen]");
    if (g) { const i = $("#n-pass", cont); i.type = "text"; i.value = claveTemporal(); }
});

$("#c-buscar").addEventListener("input", e => { busqueda = e.target.value; pintarCuentas(); });
$$("[data-est]").forEach(b => b.addEventListener("click", () => {
    $$("[data-est]").forEach(x => x.classList.remove("activo"));
    b.classList.add("activo");
    fEstado = b.dataset.est;
    pintarCuentas();
}));

$("#c-nueva").addEventListener("click", () => {
    modal(`<h2>Nueva cuenta</h2><form id="f-nueva" novalidate>
        <div class="campo"><label for="n-nombre">Nombre</label><input type="text" id="n-nombre" autocomplete="off"></div>
        <div class="campo"><label for="n-correo">Correo electrónico</label><input type="email" id="n-correo" autocomplete="off"></div>
        <div class="campo"><label for="n-pass">Contraseña</label><input type="password" id="n-pass" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>
        <small class="error" id="n-error" role="alert"></small>
        <div class="fila" style="margin:0"><button class="mini" type="button" data-gen>Generar contraseña</button><button class="mini mini--p" type="submit">Crear cuenta</button></div></form>`);
    $("#n-nombre", cont).focus();
});
cont.addEventListener("submit", e => {
    if (e.target.id !== "f-nueva") return;
    e.preventDefault();
    const r = HL.registrar({ nombre: $("#n-nombre", cont).value, correo: $("#n-correo", cont).value, pass: $("#n-pass", cont).value });
    if (!r.ok) { $("#n-error", cont).textContent = r.error; return; }
    dlg.close();
    HL.aviso("Cuenta creada.");
    pintarCuentas();
});

function descargar(nombre, texto, tipo) {
    const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
    const a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#c-csv").addEventListener("click", () => {
    const us = HL.usuarios();
    if (!us.length) return HL.aviso("No hay cuentas para exportar.");
    const celda = v => { v = String(v ?? ""); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const filas = [["Nombre", "Correo", "Creada", "Último acceso", "Inicios de sesión", "Estado"], ...us.map(u => [u.nombre, u.correo, fFecha(u.creado), fFecha(u.ultimo), u.accesos || 0, u.estado])];
    descargar("cuentas-healthylab.csv", "﻿" + filas.map(f => f.map(celda).join(",")).join("\r\n"), "text/csv;charset=utf-8");
});

/* ===== VISITAS ===== */
let rango = 7;
function pintarTrafico() {
    const vivos = conectados();
    $("#t-vivos").innerHTML = vivos.length
        ? `<ul class="feed">${vivos.map(v => `<li><span>${esc(v.u || "Visitante")} · ${esc(nombrePag(v.p))} · ${esc(v.d)}</span><small>${hace(v.t)}</small></li>`).join("")}</ul>`
        : '<p class="suave">No hay nadie conectado en este momento.</p>';

    const h0 = inicioDia();
    const desde = rango === 0 ? 0 : h0 - (rango - 1) * DIA;
    const ev = visitas().filter(e => e.t >= desde);
    const ses = sesiones(ev);
    $("#t-kpis").innerHTML = [
        kpi("Visitas", ev.length, "páginas vistas"),
        kpi("Visitantes únicos", unicos(ev), "dispositivos distintos"),
        kpi("Sesiones", ses, "visitas separadas"),
        kpi("Páginas por sesión", ses ? (ev.length / ses).toFixed(1).replace(".", ",") : "0", "promedio")
    ].join("");

    const n = rango === 1 ? 1 : rango === 0 ? 30 : rango, dias = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = h0 - i * DIA;
        dias.push({ n: fDia(d), l: n > 10 && i % 5 !== 0 ? "" : fDia(d), v: ev.filter(e => e.t >= d && e.t < d + DIA).length });
    }
    $("#t-dias-tit").textContent = rango === 0 ? "Visitas por día (últimos 30)" : "Visitas por día";
    $("#t-dias").innerHTML = barras(dias, n > 10);

    const horas = Array.from({ length: 24 }, (_, h) => ({ n: String(h).padStart(2, "0") + ":00", l: h % 3 === 0 ? String(h).padStart(2, "0") : "", v: 0 }));
    ev.forEach(e => horas[new Date(e.t).getHours()].v++);
    $("#t-horas").innerHTML = barras(horas, true);

    $("#t-pags").innerHTML = ranking(contar(ev, e => nombrePag(e.p)), "Sin visitas en este periodo.");
    $("#t-disp").innerHTML = ranking(contar(ev, e => e.d), "Sin visitas en este periodo.");
}
$$("[data-r]").forEach(b => {
    b.classList.toggle("activo", +b.dataset.r === rango);
    b.addEventListener("click", () => {
        rango = +b.dataset.r;
        $$("[data-r]").forEach(x => x.classList.toggle("activo", x === b));
        pintarTrafico();
    });
});

/* ===== VALORACIONES =====
   Las reseñas las guarda hlp.js en localStorage ("hl" -> resenas[idReceta] = [{n, e, t, f}]).
   TITULOS debe mantener el mismo orden que las tarjetas de hlp.html. */
const TITULOS = ["Ensalada de Pollo", "Avena con Frutas", "Batido de Frutas", "Salteado de Verduras", "Arroz con Pollo", "Tortilla de Verduras", "Yogur con Frutas", "Pescado al Horno", "Ensalada de Quinoa", "Panqueques de Avena", "Sopa de Verduras", "Wrap de Pollo", "Omelette Saludable", "Salmón con Vegetales", "Ensalada de Frutas", "Hamburguesa Saludable"];
let fEstrellas = 0;
const resenasGuardadas = () => { const r = (HL.LS.get("hl", {}) || {}).resenas; return r && typeof r === "object" ? r : {}; };
const estrellasTxt = n => "★".repeat(n) + "☆".repeat(5 - n);
const promedio = l => l.reduce((a, x) => a + x.e, 0) / l.length;
const dec = n => (Math.round(n * 10) / 10).toString().replace(".", ",");

function pintarValoraciones() {
    const todas = resenasGuardadas();
    const porReceta = TITULOS.map((t, id) => ({ id, t, l: Array.isArray(todas[id]) ? todas[id] : [] }));
    const total = porReceta.reduce((a, r) => a + r.l.length, 0);
    const valoradas = porReceta.filter(r => r.l.length);
    const suma = porReceta.reduce((a, r) => a + r.l.reduce((b, x) => b + x.e, 0), 0);
    const mejor = valoradas.slice().sort((a, b) => promedio(b.l) - promedio(a.l) || b.l.length - a.l.length)[0];

    $("#v-kpis").innerHTML = [
        kpi("Valoraciones", total, "comentarios recibidos"),
        kpi("Promedio general", total ? dec(suma / total) + " ★" : "-", "de 5 estrellas"),
        kpi("Recetas valoradas", `${valoradas.length} de ${TITULOS.length}`, "tienen al menos una reseña"),
        kpi("Mejor valorada", mejor ? esc(mejor.t) : "-", mejor ? `${dec(promedio(mejor.l))} ★ (${mejor.l.length})` : "aún sin reseñas")
    ].join("");

    $("#v-recetas").innerHTML = valoradas.length
        ? `<ul class="rank">${valoradas.sort((a, b) => promedio(b.l) - promedio(a.l)).map(r =>
            `<li><div><span>${esc(r.t)}</span><b>${dec(promedio(r.l))} ★ <small class="suave">(${r.l.length})</small></b></div><span class="f"><i style="--w:${Math.round(promedio(r.l) / 5 * 100)}%"></i></span></li>`).join("")}</ul>`
        : '<p class="suave">Todavía no hay valoraciones. Aparecerán aquí cuando alguien califique una receta.</p>';

    const filas = [];
    porReceta.forEach(r => r.l.forEach((x, i) => { if (!fEstrellas || x.e === fEstrellas) filas.push({ rid: r.id, i, t: r.t, x }); }));
    filas.sort((a, b) => (b.x.f || 0) - (a.x.f || 0));
    $("#v-lista").innerHTML = filas.length
        ? `<ul class="feed" style="gap:10px">${filas.map(f => `<li style="align-items:flex-start;flex-wrap:wrap">
            <div style="flex:1 1 280px"><b>${esc(f.x.n)}</b> <span aria-label="${f.x.e} de 5 estrellas" style="color:#e5a50a">${estrellasTxt(f.x.e)}</span>
            <small class="suave" style="display:block;white-space:normal">${esc(f.t)}${f.x.f ? " · " + fFecha(f.x.f) : ""}</small>
            <p style="margin:6px 0 0;overflow-wrap:anywhere">${esc(f.x.t)}</p></div>
            <button class="mini mini--peligro" type="button" data-rid="${f.rid}" data-ri="${f.i}">Eliminar</button></li>`).join("")}</ul>`
        : `<p class="vacio">${total ? "No hay comentarios con ese filtro." : "Aún no hay comentarios."}</p>`;
}

$("#v-lista").addEventListener("click", async e => {
    const b = e.target.closest("button[data-rid]");
    if (!b) return;
    const rid = +b.dataset.rid, i = +b.dataset.ri;
    const hl = HL.LS.get("hl", {}) || {}, l = hl.resenas && hl.resenas[rid];
    if (!Array.isArray(l) || !l[i]) return;
    if (!await confirmar("Eliminar comentario", `Se eliminará el comentario de ${l[i].n} en «${TITULOS[rid]}». Esta acción no se puede deshacer.`, "Eliminar")) return;
    const actual = HL.LS.get("hl", {}) || {};
    if (!actual.resenas || !Array.isArray(actual.resenas[rid])) return;
    actual.resenas[rid].splice(i, 1);
    HL.LS.set("hl", actual);
    HL.aviso("Comentario eliminado.");
    pintarValoraciones();
});
$$("[data-est-v]").forEach(b => b.addEventListener("click", () => {
    fEstrellas = +b.dataset.estV;
    $$("[data-est-v]").forEach(x => x.classList.toggle("activo", x === b));
    pintarValoraciones();
}));

/* ===== AJUSTES =====
$("#f-clave").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#a-error");
    if ($("#a-nueva").value !== $("#a-rep").value) { err.textContent = "Las contraseñas nuevas no coinciden."; return; }
    const r = HL.cambiarClaveAdmin($("#a-actual").value, $("#a-nueva").value);
    err.textContent = r.ok ? "" : r.error;
    if (!r.ok) return;
    e.target.reset();
    HL.aviso("Contraseña actualizada.");
});
$("#a-respaldo").addEventListener("click", () => {
    const cuentas = HL.usuarios().map(({ sal, hash, ...resto }) => resto);
    descargar("respaldo-healthylab.json", JSON.stringify({ fecha: new Date().toISOString(), cuentas, visitas: visitas() }, null, 2), "application/json");
});
$("#a-borrar").addEventListener("click", async () => {
    if (!await confirmar("Reiniciar estadísticas", "Se borrará el historial de visitas. Las cuentas no se tocan.", "Reiniciar")) return;
    HL.LS.del("hl_visitas"); HL.LS.del("hl_activos");
    HL.aviso("Estadísticas reiniciadas.");
});

/* ===== NAVEGACIÓN, ACTUALIZACIÓN Y SALIDA ===== */
const VISTAS = { resumen: pintarResumen, cuentas: pintarCuentas, trafico: pintarTrafico, valoraciones: pintarValoraciones, ajustes: () => { } };
let actual = "resumen";
function ir(v) {
    if (!VISTAS[v]) v = "resumen";
    actual = v;
    $$(".vista").forEach(s => s.hidden = s.id !== "v-" + v);
    $$(".tabs .filtro").forEach(b => b.classList.toggle("activo", b.dataset.v === v));
    VISTAS[v]();
    history.replaceState(null, "", "#" + v);
}
$$(".tabs .filtro").forEach(b => b.addEventListener("click", () => ir(b.dataset.v)));
addEventListener("hashchange", () => ir(location.hash.slice(1)));

setInterval(() => {
    if (!HL.sesion()) return location.replace("login.html");
    if (actual === "resumen" || actual === "trafico") VISTAS[actual]();
}, 5000);
addEventListener("storage", () => { if (actual !== "ajustes") VISTAS[actual](); });

$("#salir").addEventListener("click", () => { HL.salir(); location.replace("login.html"); });

ir(location.hash.slice(1));