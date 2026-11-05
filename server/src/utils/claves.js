import crypto from "node:crypto";
import bcrypt from "bcryptjs";

/* Las cuentas importadas del sitio anterior guardan "sha256:sal:hash".
   La primera vez que inician sesión, su contraseña pasa a bcrypt. */
const PREFIJO = "sha256:";
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const hashClave = pass => bcrypt.hash(pass, 12);
export const hashLegado = (sal, hash) => `${PREFIJO}${sal}:${hash}`;
export const esLegado = guardado => guardado.startsWith(PREFIJO);

export async function verificarClave(pass, guardado) {
    if (!esLegado(guardado)) return bcrypt.compare(pass, guardado);
    const [sal, hash] = guardado.slice(PREFIJO.length).split(":");
    const calculado = crypto.createHash("sha256").update(sal + pass, "utf8").digest();
    const esperado = Buffer.from(hash, "hex");
    return calculado.length === esperado.length && crypto.timingSafeEqual(calculado, esperado);
}

export const claveTemporal = () =>
    Array.from({ length: 12 }, () => ALFABETO[crypto.randomInt(ALFABETO.length)]).join("");
