"use strict";

(function () {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* Si ya hay una sesión activa, se redirige */
    const ses = HL.sesion();
    if (ses) { location.replace(ses.rol === "admin" ? "admin.html" : "intro.html"); return; }

    /* ===== Pestañas ===== */
    const TXT = {
        entrar: ["Bienvenido", "Ingresa con tu usuario o correo."],
        crear: ["Crea tu cuenta", "Guarda tus recetas favoritas y tu lista de compras."]
    };
    function pestana(t, enfocar = true) {
        $$("[data-tab]").forEach(b => b.classList.toggle("activo", b.dataset.tab === t));
        $("#f-entrar").hidden = t !== "entrar";
        $("#f-crear").hidden = t !== "crear";
        $("#titulo").textContent = TXT[t][0];
        $("#subtitulo").textContent = TXT[t][1];
        $("#e-error").textContent = "";
        $("#c-error").textContent = "";
        if (enfocar) (t === "entrar" ? $("#e-id") : $("#c-nombre")).focus();
    }
    $$("[data-tab]").forEach(b => b.addEventListener("click", () => pestana(b.dataset.tab)));
    if (location.hash === "#crear") pestana("crear", false);

    /* ===== Mostrar / ocultar contraseña ===== */
    $$("[data-ver]").forEach(b => b.addEventListener("click", () => {
        const i = document.getElementById(b.dataset.ver), ver = i.type === "password";
        i.type = ver ? "text" : "password";
        b.textContent = ver ? "Ocultar" : "Mostrar";
        b.setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
    }));

    /* ===== Validación por campo (pone .valido / .invalido) ===== */
    const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const REGLAS = {
        "e-id": v => v.trim() ? "" : "Escribe tu usuario o correo.",
        "e-pass": v => v ? "" : "Escribe tu contraseña.",
        "c-nombre": v => !v.trim() ? "Escribe tu nombre." : v.trim().length < 3 ? "El nombre debe tener al menos 3 letras." : "",
        "c-correo": v => !v.trim() ? "Escribe tu correo electrónico." : !CORREO.test(v.trim()) ? "Ingresa un correo válido, por ejemplo nombre@correo.com." : "",
        "c-pass": v => !v ? "Escribe una contraseña." : v.length < 8 ? "Usa al menos 8 caracteres." : "",
        "c-pass2": v => !v ? "Repite la contraseña." : v !== $("#c-pass").value ? "Las contraseñas no coinciden." : ""
    };
    function revisar(id) {
        const el = document.getElementById(id), error = REGLAS[id](el.value), campo = el.closest(".campo");
        $("#err-" + id).textContent = error;
        campo.classList.toggle("invalido", !!error);
        campo.classList.toggle("valido", !error);
        el.setAttribute("aria-invalid", !!error);
        return !error;
    }
    Object.keys(REGLAS).forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener("blur", () => { if (el.value) revisar(id); });
        el.addEventListener("input", () => {
            if (el.closest(".campo").classList.contains("invalido")) revisar(id);
            if (id === "c-pass" && $("#c-pass2").value) revisar("c-pass2");
        });
    });
    const limpiar = form => $$(".campo", form).forEach(c => c.classList.remove("valido", "invalido"));

    /* ===== Ingresar ===== */
    $("#f-entrar").addEventListener("submit", e => {
        e.preventDefault();
        const ids = ["e-id", "e-pass"], ok = ids.map(revisar);
        if (ok.includes(false)) { document.getElementById(ids[ok.indexOf(false)]).focus(); return; }
        const r = HL.login($("#e-id").value, $("#e-pass").value);
        $("#e-error").textContent = r.ok ? "" : r.error;
        if (!r.ok) { $("#e-pass").value = ""; limpiar($("#f-entrar")); $("#e-pass").focus(); return; }
        HL.aviso(r.rol === "admin" ? "Entrando al panel..." : "Sesión iniciada.");
        setTimeout(() => location.replace(r.rol === "admin" ? "admin.html" : "intro.html"), 500);
    });

    /* ===== Crear cuenta ===== */
    $("#f-crear").addEventListener("submit", e => {
        e.preventDefault();
        const ids = ["c-nombre", "c-correo", "c-pass", "c-pass2"], ok = ids.map(revisar);
        if (ok.includes(false)) { document.getElementById(ids[ok.indexOf(false)]).focus(); return; }
        const r = HL.registrar({ nombre: $("#c-nombre").value, correo: $("#c-correo").value, pass: $("#c-pass").value });
        $("#c-error").textContent = r.ok ? "" : r.error;
        if (!r.ok) return;
        const entrada = HL.login($("#c-correo").value, $("#c-pass").value);
        HL.aviso("Cuenta creada. ¡Bienvenido!");
        setTimeout(() => location.replace(entrada.ok ? "intro.html" : "login.html"), 600);
    });
})();