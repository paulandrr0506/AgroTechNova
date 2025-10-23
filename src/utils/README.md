# 📁 CARPETA: UTILS

## Propósito
Contiene **funciones utilitarias** reutilizables en todo el proyecto.

## Responsabilidades
- Funciones auxiliares (formateo de fechas, validaciones, etc.)
- Helpers de encriptación (bcrypt para contraseñas)
- Generación de tokens (JWT o similar)
- Validadores de datos (emails, teléfonos, etc.)
- Funciones de formateo de respuestas HTTP

## Estructura esperada
```
utils/
├── crypto.js                 → Sprint 1: Hash de contraseñas, tokens
├── validators.js             → Sprint 1+: Validaciones comunes
├── responseHelper.js         → Sprint 1+: Formateo de respuestas JSON
├── dateHelper.js             → Sprint 2+: Manejo de fechas
└── fileHelper.js             → Sprint 5+: Manejo de archivos y uploads
```

## Principios
- **Funciones puras**: No dependen de estado externo
- **Reutilización máxima**: Evitar duplicar código
- **Testing fácil**: Funciones simples y testeables
- **Sin efectos secundarios**: No modifican datos globales

## Ejemplo de estructura de utilidad
```javascript
// Ejemplo: crypto.js (Sprint 1)
const crypto = require('crypto');

/**
 * Genera un hash seguro de una contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña coincide con un hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} storedHash - Hash almacenado
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
}

module.exports = { hashPassword, verifyPassword };
```

## Notas académicas
- Usar módulos nativos de Node.js cuando sea posible (crypto, path, fs)
- Evitar instalar librerías externas innecesarias
- Documentar claramente cada función utilitaria
