import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

const { MONGODB_URI, ADMIN_CORREO, ADMIN_PASS } = process.env;

if (!ADMIN_CORREO || !ADMIN_PASS) {
    console.error("Faltan ADMIN_CORREO o ADMIN_PASS en server/.env");
    process.exit(1);
}
if (ADMIN_PASS.length < 10) {
    console.error("ADMIN_PASS debe tener al menos 10 caracteres.");
    process.exit(1);
}

try {
    await mongoose.connect(MONGODB_URI);
    const existe = await Usuario.findOne({ rol: "admin" });
    if (existe) {
        console.log(`Ya existe un administrador (${existe.correo}). No se creó otro.`);
    } else {
        const hash = await bcrypt.hash(ADMIN_PASS, 12);
        await Usuario.create({ nombre: "Administrador", correo: ADMIN_CORREO, hash, rol: "admin" });
        console.log(`Administrador creado: ${ADMIN_CORREO}`);
        console.log("Ahora borra la línea ADMIN_PASS de server/.env");
    }
} catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}