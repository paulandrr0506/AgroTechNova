/**
 * VALIDADORES - AGROTECHNOVA
 * 
 * Funciones de validación de datos comunes.
 * Reutilizables en todo el sistema.
 */

/**
 * Valida formato de correo electrónico
 * 
 * @param {string} email - Correo a validar
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex simple pero efectivo para emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida que un string no esté vacío
 * 
 * @param {string} str - String a validar
 * @param {number} minLength - Longitud mínima (opcional)
 * @returns {boolean}
 */
function isNotEmpty(str, minLength = 1) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  return str.trim().length >= minLength;
}

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * 
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // Eliminar caracteres peligrosos para SQL injection
  return str
    .trim()
    .replace(/[<>'"]/g, '') // Eliminar < > ' "
    .substring(0, 255); // Limitar longitud
}

/**
 * Valida que un valor sea un ID válido (número entero positivo)
 * 
 * @param {any} id - ID a validar
 * @returns {boolean}
 */
function isValidId(id) {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
}

/**
 * Valida que un rol sea válido
 * 
 * @param {number} rolId - ID del rol
 * @returns {boolean}
 */
function isValidRole(rolId) {
  const validRoles = [1, 2, 3]; // 1=Admin, 2=Asesor, 3=Productor
  return validRoles.includes(parseInt(rolId, 10));
}

/**
 * Valida que un estado sea válido
 * 
 * @param {string} estado - Estado a validar
 * @returns {boolean}
 */
function isValidEstado(estado) {
  const validEstados = ['activo', 'inactivo'];
  return validEstados.includes(estado);
}

/**
 * Valida que un valor sea un número positivo
 * 
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

module.exports = {
  isValidEmail,
  isNotEmpty,
  sanitizeString,
  isValidId,
  isValidRole,
  isValidEstado,
  isPositiveNumber
};
