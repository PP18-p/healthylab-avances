"use strict";

/* ===== Página principal (index.html) =====
   auth.js ya registra la visita al cargar. Aquí solo se redirige a quien ya tiene sesión:
   administrador -> panel; cualquier otra persona -> página de recetas. */
(function () {
    const s = HL.sesion();
    if (!s) return;
    location.replace(s.rol === "admin" ? "admin.html" : "hlp.html");
})();
