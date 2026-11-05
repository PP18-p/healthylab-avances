/* Cambia la contraseña del administrador cuando no se recuerda la actual.
   Se escribe en la terminal para no guardarla en .env ni en el historial de comandos.
     npm run restablecer-admin */
import { createInterface } from "node:readline/promises";
import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";
import { hashClave } from "../utils/claves.js";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const clave = await rl.question("Nueva contraseña del administrador (mínimo 10 caracteres): ");
rl.close();

if (clave.length < 10) {
    console.error("La contraseña debe tener al menos 10 caracteres. No se cambió nada.");
    process.exit(1);
}

try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await Usuario.findOne({ rol: "admin" });
    if (!admin) {
        console.error("No existe un administrador. Créalo con: npm run crear-admin");
        process.exitCode = 1;
    } else {
        admin.hash = await hashClave(clave);
        await admin.save();
        console.log("Contraseña actualizada. Entra con el usuario: admin");
    }
} catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
