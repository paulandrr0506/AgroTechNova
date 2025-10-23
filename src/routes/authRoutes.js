/**
 * RUTAS DE AUTENTICACIÓN - AGROTECHNOVA
 * 
 * Define endpoints para login, logout, verificación de sesión y recuperación de contraseña.
 */

const AuthController = require('../controllers/authController');

/**
 * Maneja las rutas de autenticación
 * @param {string} pathname - Ruta solicitada
 * @param {string} method - Método HTTP
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
function handleAuthRoutes(pathname, method, req, res) {
  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    return AuthController.login(req, res);
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return AuthController.logout(req, res);
  }

  // GET /api/auth/session
  if (pathname === '/api/auth/session' && method === 'GET') {
    return AuthController.checkSession(req, res);
  }

  // POST /api/auth/forgot-password
  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    return AuthController.forgotPassword(req, res);
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
}

module.exports = handleAuthRoutes;
