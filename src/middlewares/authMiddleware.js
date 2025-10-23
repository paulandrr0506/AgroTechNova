/**
 * MIDDLEWARE DE AUTENTICACIÓN - AGROTECHNOVA
 * 
 * Protege rutas y verifica permisos de acceso.
 * 
 * Cumple con:
 * - RNF16: Autenticación y control de accesos
 * - RF49: Control de permisos por rol
 */

const { getSession } = require('../utils/sessionManager');

class AuthMiddleware {
  /**
   * Extrae y valida la sesión desde las cookies
   */
  static extractSession(req) {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split('; ')
      .find(row => row.startsWith('sessionId='))
      ?.split('=')[1];

    if (!sessionId) {
      return null;
    }

    return getSession(sessionId);
  }

  /**
   * Middleware: Requiere autenticación
   * Verifica que el usuario tenga una sesión activa
   * @returns {boolean} true si está autenticado, false si no (y envía respuesta de error)
   */
  static requireAuth(req, res) {
    const session = AuthMiddleware.extractSession(req);

    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      }));
      return false;
    }

    // Agregar información de sesión al request
    req.session = session;
    return true;
  }

  /**
   * Middleware: Requiere rol de administrador
   * Solo permite acceso a usuarios con rol "administrador"
   * @returns {boolean} true si es admin, false si no (y envía respuesta de error)
   */
  static requireAdmin(req, res) {
    const session = AuthMiddleware.extractSession(req);

    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      }));
      return false;
    }

    if (session.rol !== 'administrador') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para realizar esta acción'
      }));
      return false;
    }

    req.session = session;
    return true;
  }

  /**
   * Middleware: Requiere roles específicos
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @param {Array<string>} allowedRoles - Roles permitidos
   * @returns {boolean} true si tiene uno de los roles permitidos, false si no
   */
  static requireRoles(req, res, ...allowedRoles) {
    const session = AuthMiddleware.extractSession(req);

    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      }));
      return false;
    }

    if (!allowedRoles.includes(session.rol)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para realizar esta acción'
      }));
      return false;
    }

    req.session = session;
    return true;
  }
}

module.exports = AuthMiddleware;
