/* ===== IMPORTA LOS DATOS DEL SITIO ANTERIOR (localStorage) A MONGODB =====
   Por defecto solo simula y no escribe nada. Se puede ejecutar varias veces sin duplicar datos.

     node --env-file=.env src/scripts/importar.js importacion/datos.json
     node --env-file=.env src/scripts/importar.js importacion/datos.json --aplicar

   Con varios archivos: importar.js a.json b.json --aplicar

   Favoritos, lista y plan se guardaban por navegador, no por cuenta. Para asignarlos,
   indica un solo archivo y el correo de su dueño (solo se aplica si esa cuenta aún no tiene ninguno):
     importar.js a.json --estado correo@ejemplo.com --aplicar

   No se importan ni la contraseña del administrador ni las sesiones. */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";

const args = process.argv.slice(2);
const aplicar = args.includes("--aplicar");
const iEstado = args.indexOf("--estado");
const correoEstado = iEstado >= 0 ? String(args[iEstado + 1] || "").trim().toLowerCase() : null;
const archivos = args.filter((a, i) => !a.startsWith("--") && !(iEstado >= 0 && i === iEstado + 1));

if (!archivos.length) {
    console.error("Indica al menos un archivo JSON. Ejemplo: importar.js importacion/datos.json");
    process.exit(1);
}
if (iEstado >= 0 && (!correoEstado || archivos.length !== 1)) {
    console.error("--estado necesita un correo y exactamente un archivo.");
    process.exit(1);
}

// En simulación no se crean colecciones ni índices. Por eso los modelos se cargan después de esto.
mongoose.set("autoIndex", aplicar);
mongoose.set("autoCreate", aplicar);
const { default: Usuario } = await import("../models/Usuario.js");
const { default: Resena } = await import("../models/Resena.js");
const { default: Visita } = await import("../models/Visita.js");
const { hashLegado } = await import("../utils/claves.js");
const { validarEstado } = await import("../utils/validarEstado.js");

const NOVENTA_DIAS = 90 * 864e5; // las visitas más antiguas las borraría MongoDB de todos modos
const r = {
    cuentas: { nuevas: 0, yaExistian: 0, invalidas: 0, antiguas: 0 },
    resenas: { nuevas: 0, yaExistian: 0, invalidas: 0, antiguas: 0 },
    visitas: { nuevas: 0, yaExistian: 0, invalidas: 0, antiguas: 0 },
};

const leer = ruta => {
    const d = JSON.parse(readFileSync(ruta, "utf8"));
    return { usuarios: d.hl_users || [], hl: d.hl || {}, visitas: d.hl_visitas || [] };
};
const valido = async doc => { try { await doc.validate(); return true; } catch { return false; } };
const fecha = t => (Number.isFinite(t) && t > 0 ? new Date(t) : null);

async function importarCuentas(lista) {
    const correos = new Set((await Usuario.find({}, "correo").lean()).map(u => u.correo));
    for (const u of lista) {
        const correo = String(u?.correo || "").trim().toLowerCase();
        if (correos.has(correo)) { r.cuentas.yaExistian++; continue; }
        if (!u?.sal || !/^[0-9a-f]{64}$/.test(u?.hash || "")) { r.cuentas.invalidas++; continue; }
        const doc = new Usuario({
            nombre: u.nombre,
            correo,
            hash: hashLegado(u.sal, u.hash),
            estado: u.estado === "suspendido" ? "suspendido" : "activo",
            ultimo: fecha(u.ultimo),
            accesos: Number.isInteger(u.accesos) ? u.accesos : 0,
            createdAt: fecha(u.creado) || new Date(),
        });
        if (!(await valido(doc))) { r.cuentas.invalidas++; continue; }
        if (aplicar) await doc.save();
        correos.add(correo);
        r.cuentas.nuevas++;
    }
}

async function importarResenas(hl) {
    const clave = (receta, nombre, texto, t) => `${receta}|${nombre}|${texto}|${t}`;
    const vistas = new Set((await Resena.find().lean()).map(x => clave(x.receta, x.nombre, x.texto, x.createdAt.getTime())));
    for (const [receta, lista] of Object.entries(hl.resenas || {})) {
        for (const x of Array.isArray(lista) ? lista : []) {
            const t = fecha(x?.f) || new Date(0); // las reseñas muy viejas no guardaban fecha
            const doc = new Resena({ receta: Number(receta), usuario: null, nombre: x?.n, estrellas: x?.e, texto: x?.t, createdAt: t });
            if (!(await valido(doc))) { r.resenas.invalidas++; continue; }
            const k = clave(doc.receta, doc.nombre, doc.texto, t.getTime());
            if (vistas.has(k)) { r.resenas.yaExistian++; continue; }
            if (aplicar) await doc.save();
            vistas.add(k);
            r.resenas.nuevas++;
        }
    }
}

async function importarVisitas(lista) {
    const clave = (vid, sid, pagina, t) => `${vid}|${sid}|${pagina}|${t}`;
    const vistas = new Set((await Visita.find().lean()).map(v => clave(v.vid, v.sid, v.pagina, v.fecha.getTime())));
    const nuevas = [];
    for (const e of lista) {
        const t = fecha(e?.t);
        if (!t) { r.visitas.invalidas++; continue; }
        if (t.getTime() < Date.now() - NOVENTA_DIAS) { r.visitas.antiguas++; continue; }
        const doc = new Visita({ fecha: t, vid: e.v, sid: e.s, pagina: e.p, disp: e.d, usuario: e.u ?? null });
        if (!(await valido(doc))) { r.visitas.invalidas++; continue; }
        const k = clave(doc.vid, doc.sid, doc.pagina, t.getTime());
        if (vistas.has(k)) { r.visitas.yaExistian++; continue; }
        vistas.add(k);
        nuevas.push(doc);
    }
    if (aplicar && nuevas.length) await Visita.insertMany(nuevas, { ordered: false });
    r.visitas.nuevas += nuevas.length;
}

async function importarEstado(hl) {
    const cambios = validarEstado({ favs: hl.favs ?? [], lista: hl.lista ?? [], plan: hl.plan ?? {} });
    if (!cambios) return "los datos del archivo no son válidos; no se aplicó";
    const u = await Usuario.findOne({ correo: correoEstado });
    // En una simulación la cuenta puede venir en este mismo archivo y aún no existir
    if (!u) return aplicar ? "no existe esa cuenta; no se aplicó" : "se aplicará solo si la cuenta existe al importar";
    if (u.favs.length || u.lista.length || Object.keys(u.plan || {}).length) return "la cuenta ya tiene datos; no se tocó";
    if (aplicar) await Usuario.updateOne({ _id: u._id }, { $set: cambios });
    return `${cambios.favs.length} favoritos, ${cambios.lista.length} en la lista, ${Object.keys(cambios.plan).length} en el plan`;
}

try {
    const datos = archivos.map(leer); // si un archivo está mal, falla antes de escribir nada
    await mongoose.connect(process.env.MONGODB_URI);
    if (aplicar) await Promise.all([Usuario.init(), Resena.init(), Visita.init()]);

    for (const d of datos) {
        await importarCuentas(d.usuarios);
        await importarResenas(d.hl);
        await importarVisitas(d.visitas);
    }
    const estado = correoEstado ? await importarEstado(datos[0].hl) : null;

    console.log(aplicar ? "IMPORTACIÓN APLICADA" : "SIMULACIÓN: no se escribió nada. Para importar, añade --aplicar");
    console.table(r);
    if (estado) console.log("Favoritos, lista y plan:", estado);
} catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
