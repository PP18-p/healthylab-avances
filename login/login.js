"use strict";

(function () {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* Si ya hay una sesión activa, se redirige */
    const s = HL.sesion();
    if (s) { location.replace(s.rol === "admin" ? "admin.html" : "intro.html"); return; }

    /* ===== Pestañas ===== */
    const TXT = {
        entrar: ["Bienvenido", "Ingresa con tu usuario o correo."],
        crear: ["Crea tu cuenta", "Guarda tus recetas favoritas y tu lista de compras."]
    };
    function pestana(t) {
        $$("[data-tab]").forEach(b => b.classList.toggle("activo", b.dataset.tab === t));
        $("#f-entrar").hidden = t !== "entrar";
        $("#f-crear").hidden = t !== "crear";
        $("#auth-titulo").textContent = TXT[t][0];
        $("#auth-sub").textContent = TXT[t][1];
        (t === "entrar" ? $("#e-id") : $("#c-nombre")).focus();
    }
    $$("[data-tab]").forEach(b => b.addEventListener("click", () => pestana(b.dataset.tab)));
    if (location.hash === "#crear") pestana("crear");

    /* Mostrar / ocultar contraseña */
    $$("[data-ver]").forEach(b => b.addEventListener("click", () => {
        const i = document.getElementById(b.dataset.ver), ver = i.type === "password";
        i.type = ver ? "text" : "password";
        b.textContent = ver ? "Ocultar" : "Mostrar";
        b.setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
    }));

    /* ===== Ingresar ===== */
    $("#f-entrar").addEventListener("submit", e => {
        e.preventDefault();
        const r = HL.login($("#e-id").value, $("#e-pass").value);
        $("#e-error").textContent = r.ok ? "" : r.error;
        if (!r.ok) { $("#e-pass").value = ""; $("#e-pass").focus(); return; }
        HL.aviso(r.rol === "admin" ? "Entrando al panel..." : "Sesión iniciada.");
        setTimeout(() => location.replace(r.rol === "admin" ? "admin.html" : "intro.html"), 500);
    });

    /* ===== Crear cuenta ===== */
    $("#f-crear").addEventListener("submit", e => {
        e.preventDefault();
        const err = $("#c-error");
        if ($("#c-pass").value !== $("#c-pass2").value) { err.textContent = "Las contraseñas no coinciden."; return; }
        const r = HL.registrar({ nombre: $("#c-nombre").value, correo: $("#c-correo").value, pass: $("#c-pass").value });
        err.textContent = r.ok ? "" : r.error;
        if (!r.ok) return;
        const ses = HL.login($("#c-correo").value, $("#c-pass").value);
        HL.aviso("Cuenta creada. ¡Bienvenido!");
        setTimeout(() => location.replace(ses.ok ? "intro.html" : "login.html"), 600);
    });
})();