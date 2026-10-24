// ===== HealthyLab | Verificación de login =====
// Nota: esto valida en el navegador (localStorage). Sirve para el proyecto,
// pero una verificación real de usuarios necesita un servidor.

const CLAVE_USUARIOS = "healthylab_usuarios";
const CLAVE_SESION = "healthylab_sesion";
const DESTINO = "index.html";

const form = document.getElementById("formulario");
const titulo = document.getElementById("titulo");
const boton = document.getElementById("boton");
const cambiar = document.getElementById("cambiar");
const textoCambio = document.getElementById("texto-cambio");
const campoConfirmar = document.getElementById("campo-confirmar");
const errorGeneral = document.getElementById("error-general");

const inputUsuario = document.getElementById("usuario");
const inputClave = document.getElementById("contraseña");
const inputConfirmar = document.getElementById("confirmar");

let modoRegistro = new URLSearchParams(location.search).get("modo") === "registro";

/* ---------- Almacenamiento ---------- */
const leerUsuarios = () => {
    try { return JSON.parse(localStorage.getItem(CLAVE_USUARIOS)) || {}; }
    catch { return {}; }
};
const guardarUsuarios = (u) => localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(u));

async function cifrar(texto) {
    const datos = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest("SHA-256", datos);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Reglas de validación ---------- */
function validarUsuario(v) {
    if (!v) return "Escribe un usuario.";
    if (v.length < 7) return "Mínimo 7 caracteres.";
    if (v.length > 20) return "Máximo 20 caracteres.";
    if (!/^[A-Za-z]/.test(v)) return "Debe empezar con una letra.";
    if (!/^[A-Za-z0-9._]+$/.test(v)) return "Solo letras, números, punto y guion bajo.";
    return "";
}

function validarClave(v) {
    if (!v) return "Escribe una contraseña.";
    if (v.length < 8) return "Mínimo 8 caracteres.";
    if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) return "Usa mayúsculas y minúsculas.";
    if (!/[0-9]/.test(v)) return "Incluye al menos un número.";
    return "";
}

/* ---------- Mostrar errores ---------- */
function marcar(input, mensaje) {
    const campo = input.closest(".campo");
    const aviso = document.getElementById("error-" + (input.id === "usuario" ? "user" : input.id));
    campo.classList.toggle("invalido", Boolean(mensaje));
    campo.classList.toggle("valido", !mensaje && input.value !== "");
    if (aviso) aviso.textContent = mensaje;
    return !mensaje;
}

function limpiarGeneral() { errorGeneral.textContent = ""; }

/* ---------- Cambiar entre iniciar sesión y registrarse ---------- */
function aplicarModo() {
    titulo.textContent = modoRegistro ? "Crea tu cuenta" : "Inicia sesión";
    boton.textContent = modoRegistro ? "Registrarme" : "Iniciar sesión";
    textoCambio.textContent = modoRegistro ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?";
    cambiar.textContent = modoRegistro ? "Inicia sesión" : "Regístrate";
    campoConfirmar.hidden = !modoRegistro;
    inputClave.autocomplete = modoRegistro ? "new-password" : "current-password";
    form.reset();
    document.querySelectorAll(".campo").forEach(c => c.classList.remove("valido", "invalido"));
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
}

cambiar.addEventListener("click", (e) => {
    e.preventDefault();
    modoRegistro = !modoRegistro;
    aplicarModo();
});

/* ---------- Validación en vivo ---------- */
inputUsuario.addEventListener("input", () => { limpiarGeneral(); marcar(inputUsuario, validarUsuario(inputUsuario.value.trim())); });
inputClave.addEventListener("input", () => {
    limpiarGeneral();
    // En login no exigimos formato (solo que la cuenta exista), en registro sí.
    marcar(inputClave, modoRegistro ? validarClave(inputClave.value) : (inputClave.value ? "" : "Escribe tu contraseña."));
});
inputConfirmar.addEventListener("input", () => {
    marcar(inputConfirmar, inputConfirmar.value === inputClave.value ? "" : "Las contraseñas no coinciden.");
});

/* ---------- Envío ---------- */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarGeneral();

    const usuario = inputUsuario.value.trim();
    const clave = inputClave.value;

    const okUsuario = marcar(inputUsuario, validarUsuario(usuario));
    const okClave = marcar(inputClave, modoRegistro ? validarClave(clave) : (clave ? "" : "Escribe tu contraseña."));
    let okConfirmar = true;
    if (modoRegistro) {
        okConfirmar = marcar(inputConfirmar, inputConfirmar.value === clave ? "" : "Las contraseñas no coinciden.");
    }
    if (!okUsuario || !okClave || !okConfirmar) return;

    const usuarios = leerUsuarios();
    const llave = usuario.toLowerCase();
    const hash = await cifrar(clave);

    if (modoRegistro) {
        if (usuarios[llave]) {
            marcar(inputUsuario, "Ese usuario ya existe.");
            return;
        }
        usuarios[llave] = hash;
        guardarUsuarios(usuarios);
    } else {
        // Solo pasa si la cuenta existe y la contraseña coincide
        if (!usuarios[llave] || usuarios[llave] !== hash) {
            errorGeneral.textContent = "Usuario o contraseña incorrectos.";
            return;
        }
    }

    sessionStorage.setItem(CLAVE_SESION, usuario);
    location.href = DESTINO;
});

aplicarModo();