/**
 * UTILIDADES DE CIFRADO - AGROTECHNOVA
 * 
 * Módulo para cifrado de contraseñas usando Node.js nativo (crypto).
 * Sin librerías externas como bcrypt.
 * 
 * Cumple con:
 * - RF58: Autenticación segura
 * - RNF07: Cifrado de datos
 * - RNF16: Almacenamiento seguro de contraseñas
 */

const crypto = require('crypto');

/**
 * Configuración del algoritmo de hash
 */
const HASH_CONFIG = {
  algorithm: 'sha512',
  iterations: 10000,
  keyLength: 64,
  saltLength: 16
};

/**
 * Genera un hash seguro de una contraseña
 * Usa PBKDF2 (Password-Based Key Derivation Function 2)
 * 
 * @param {string} password - Contraseña en texto plano
 * @returns {string} - String en formato "salt:hash"
 */
function hashPassword(password) {
  // Validar que la contraseña no esté vacía
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña debe ser un string no vacío');
  }

  // Generar salt aleatorio
  const salt = crypto.randomBytes(HASH_CONFIG.saltLength).toString('hex');

  // Generar hash usando PBKDF2
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_CONFIG.iterations,
    HASH_CONFIG.keyLength,
    HASH_CONFIG.algorithm
  ).toString('hex');

  // Retornar en formato "salt:hash"
  return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña coincide con un hash almacenado
 * 
 * @param {string} password - Contraseña en texto plano
 * @param {string} storedHash - Hash almacenado en formato "salt:hash"
 * @returns {boolean} - true si coincide, false si no
 */
function verifyPassword(password, storedHash) {
  // Validaciones
  if (!password || !storedHash) {
    return false;
  }

  // Separar salt y hash
  const [salt, originalHash] = storedHash.split(':');

  if (!salt || !originalHash) {
    return false;
  }

  // Generar hash con el mismo salt
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    HASH_CONFIG.iterations,
    HASH_CONFIG.keyLength,
    HASH_CONFIG.algorithm
  ).toString('hex');

  // Comparación segura (tiempo constante para evitar timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(originalHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

/**
 * Genera un token aleatorio para recuperación de contraseña
 * 
 * @param {number} length - Longitud del token (por defecto 32 bytes)
 * @returns {string} - Token hexadecimal
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Valida la fortaleza de una contraseña
 * Requisitos (RF58):
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un carácter especial
 * 
 * @param {string} password - Contraseña a validar
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      message: 'La contraseña es requerida'
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra mayúscula'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra minúscula'
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos un carácter especial'
    };
  }

  return {
    valid: true,
    message: 'Contraseña válida'
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  validatePasswordStrength
};
