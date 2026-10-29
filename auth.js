"use strict";

/* ===== AUTENTICACIÓN, CUENTAS Y RASTREO DE VISITAS (HealthyLab) =====
   Todo se guarda en localStorage del navegador. Es una solución de front-end:
   sirve para maquetar y probar, pero no es seguridad real (ver nota en el chat). */
(function () {
    const SAL = "hl-admin-salt-7f3a";
    const HASH_ADMIN = "2d4c1819423cb5f98b630db6b3d565a0d9359b558dda90384660489af01c1c47";

    const LS = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
        del(k) { try { localStorage.removeItem(k); } catch (e) { } }
    };

    /* SHA-256 en JavaScript puro (funciona también abriendo el archivo sin servidor) */
    function sha256(texto) {
        const rr = (v, a) => (v >>> a) | (v << (32 - a));
        const k = [], hash = [];
        let n = 0;
        for (let c = 2; n < 64; c++) {
            let primo = true;
            for (let d = 2; d * d <= c; d++) if (c % d === 0) { primo = false; break; }
            if (primo) {
                if (n < 8) hash[n] = (Math.pow(c, 0.5) * 4294967296) | 0;
                k[n++] = (Math.pow(c, 1 / 3) * 4294967296) | 0;
            }
        }
        let s = unescape(encodeURIComponent(texto));
        const bits = s.length * 8;
        s += "\x80";
        while (s.length % 64 - 56) s += "\x00";
        const words = [];
        for (let i = 0; i < s.length; i++) words[i >> 2] |= s.charCodeAt(i) << ((3 - i) % 4) * 8;
        words[words.length] = (bits / 4294967296) | 0;
        words[words.length] = bits;
        let h = hash;
        for (let j = 0; j < words.length;) {
            const w = words.slice(j, j += 16), old = h;
            h = h.slice(0, 8);
            for (let i = 0; i < 64; i++) {
                const w15 = w[i - 15], w2 = w[i - 2], a = h[0], e = h[4];
                const t1 = h[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + k[i] +
                    (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
                const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
                h = [(t1 + t2) | 0].concat(h);
                h[4] = (h[4] + t1) | 0;
            }
            for (let i = 0; i < 8; i++) h[i] = (h[i] + old[i]) | 0;
        }
        let out = "";
        for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) { const b = (h[i] >> (j * 8)) & 255; out += (b < 16 ? "0" : "") + b.toString(16); }
        return out;
    }

    const bytes = n => {
        const a = new Uint8Array(n);
        if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
        else for (let i = 0; i < n; i++) a[i] = Math.random() * 256;
        return a;
    };
    const rnd = n => [...bytes(Math.ceil(n / 2))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, n);
    const norm = t => String(t || "").trim().toLowerCase();
    const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* ===== CUENTAS ===== */
    const usuarios = () => LS.get("hl_users", []);
    const guardarUsuarios = u => LS.set("hl_users", u);

    function registrar({ nombre, correo, pass }) {
        nombre = String(nombre || "").trim();
        correo = norm(correo);
        pass = String(pass || "");
        if (nombre.length < 3) return { ok: false, error: "El nombre debe tener al menos 3 letras." };
        if (!CORREO.test(correo)) return { ok: false, error: "Ingresa un correo válido, por ejemplo nombre@correo.com." };
        if (pass.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
        const lista = usuarios();
        if (lista.some(u => u.correo === correo)) return { ok: false, error: "Ya existe una cuenta con ese correo." };
        const sal = rnd(12);
        const u = { id: rnd(8), nombre, correo, sal, hash: sha256(sal + pass), creado: Date.now(), ultimo: null, accesos: 0, estado: "activo" };
        lista.push(u);
        guardarUsuarios(lista);
        return { ok: true, usuario: u };
    }

    /* ===== SESIÓN ===== */
    function sesion() {
        const s = LS.get("hl_sesion", null);
        if (!s || s.exp < Date.now()) return null;
        if (s.rol === "usuario") {
            const u = usuarios().find(x => x.correo === s.correo);
            if (!u || u.estado !== "activo") { LS.del("hl_sesion"); return null; }
        }
        return s;
    }

    function login(id, pass) {
        const lim = LS.get("hl_intentos", { n: 0, hasta: 0 });
        if (lim.hasta > Date.now()) return { ok: false, error: `Demasiados intentos. Espera ${Math.ceil((lim.hasta - Date.now()) / 1000)} s.` };
        id = norm(id); pass = String(pass || "");
        if (!id || !pass) return { ok: false, error: "Completa ambos campos." };
        const falla = () => {
            lim.n++;
            if (lim.n >= 5) { lim.n = 0; lim.hasta = Date.now() + 60000; }
            LS.set("hl_intentos", lim);
            return { ok: false, error: "Usuario o contraseña incorrectos." };
        };
        if (id === "admin") {
            if (sha256(SAL + pass) !== LS.get("hl_admin_hash", HASH_ADMIN)) return falla();
            LS.del("hl_intentos");
            LS.set("hl_sesion", { usuario: "admin", nombre: "Administrador", rol: "admin", exp: Date.now() + 2 * 3600e3 });
            return { ok: true, rol: "admin" };
        }
        const lista = usuarios(), u = lista.find(x => x.correo === id);
        if (!u || sha256(u.sal + pass) !== u.hash) return falla();
        if (u.estado !== "activo") return { ok: false, error: "Tu cuenta está suspendida. Contacta al administrador." };
        LS.del("hl_intentos");
        u.ultimo = Date.now(); u.accesos = (u.accesos || 0) + 1;
        guardarUsuarios(lista);
        LS.set("hl_sesion", { correo: u.correo, nombre: u.nombre, rol: "usuario", exp: Date.now() + 7 * 864e5 });
        return { ok: true, rol: "usuario" };
    }

    const salir = () => LS.del("hl_sesion");

    function cambiarClaveAdmin(actual, nueva) {
        if (sha256(SAL + actual) !== LS.get("hl_admin_hash", HASH_ADMIN)) return { ok: false, error: "La contraseña actual no es correcta." };
        if (String(nueva).length < 10) return { ok: false, error: "La nueva contraseña debe tener al menos 10 caracteres." };
        LS.set("hl_admin_hash", sha256(SAL + nueva));
        return { ok: true };
    }

    let tAviso;
    function aviso(msg) {
        const a = document.getElementById("aviso");
        if (!a) return;
        a.textContent = msg;
        a.classList.add("visible");
        clearTimeout(tAviso);
        tAviso = setTimeout(() => a.classList.remove("visible"), 3500);
    }

    window.HL = { LS, sha256, bytes, rnd, usuarios, guardarUsuarios, registrar, login, sesion, salir, cambiarClaveAdmin, aviso };

    /* ===== TEMA (solo en login y panel; en index y hlp lo maneja su propio script) ===== */
    const pagina = document.body.dataset.pagina || "sitio";
    if (pagina !== "sitio") {
        const raiz = document.documentElement, boton = document.getElementById("modo-oscuro");
        const guardado = LS.get("tema", null) || (function () { try { return localStorage.getItem("tema"); } catch (e) { return null; } })();
        const aplicar = t => { raiz.dataset.tema = t; if (boton) boton.setAttribute("aria-label", t === "oscuro" ? "Activar modo claro" : "Activar modo oscuro"); };
        aplicar(guardado === "oscuro" || guardado === "claro" ? guardado : (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro"));
        if (boton) boton.addEventListener("click", () => {
            const n = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
            aplicar(n);
            try { localStorage.setItem("tema", n); } catch (e) { }
        });
    }

    /* ===== ENLACE «INGRESAR» DEL ENCABEZADO DEL SITIO ===== */
    const acc = document.getElementById("acceso");
    if (acc) {
        const s = sesion();
        if (s) {
            acc.textContent = "Salir";
            acc.href = "#";
            acc.title = "Sesión de " + s.nombre;
            acc.addEventListener("click", e => { e.preventDefault(); salir(); location.reload(); });
            if (s.rol === "admin") acc.insertAdjacentHTML("beforebegin", '<a class="nav__link" href="admin.html">Panel</a>');
        }
    }

    /* ===== RASTREO DE VISITAS (no se cuenta el propio panel) ===== */
    if (pagina !== "admin") {
        const vid = LS.get("hl_vid", null) || (function () { const v = rnd(10); LS.set("hl_vid", v); return v; })();
        let sid;
        try { sid = sessionStorage.getItem("hl_sid"); if (!sid) { sid = rnd(8); sessionStorage.setItem("hl_sid", sid); } } catch (e) { sid = rnd(8); }
        const pag = location.pathname.split("/").pop() || "index.html";
        const u = LS.get("hl_sesion", null);
        const quien = u && u.exp > Date.now() ? u.nombre : null;
        const disp = /iPad|Tablet/i.test(navigator.userAgent) ? "Tablet" : /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Móvil" : "Escritorio";

        const ev = LS.get("hl_visitas", []);
        ev.push({ t: Date.now(), v: vid, s: sid, p: pag, d: disp, u: quien });
        if (ev.length > 3000) ev.splice(0, ev.length - 3000);
        LS.set("hl_visitas", ev);

        const latido = () => {
            const a = LS.get("hl_activos", {}), lim = Date.now() - 120000;
            for (const id in a) if (a[id].t < lim) delete a[id];
            a[sid] = { t: Date.now(), p: pag, d: disp, u: quien };
            LS.set("hl_activos", a);
        };
        latido();
        setInterval(latido, 15000);
        addEventListener("pagehide", () => { const a = LS.get("hl_activos", {}); delete a[sid]; LS.set("hl_activos", a); });
    }
})();