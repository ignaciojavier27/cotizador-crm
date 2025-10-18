import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
/**
 * Hashea una contraseña usando bcrypt
 * @param password - La contraseña a hashear
 * @returns La contraseña hasheada
 */

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}


/**
 * Compara una contraseña en texto plano con una contraseña hasheada
 * @param password - La contraseña en texto plano
 * @param hashedPassword - La contraseña hasheada
 * @returns true si las contraseña coinciden, false en caso contrario
 */

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}