/**
 * RUTAS DE USUARIOS - AGROTECHNOVA
 * 
 * Define endpoints para gestión CRUD de usuarios (protegidos con autenticación).
 */

const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middlewares/authMiddleware');

/**
 * Maneja las rutas de usuarios
 * @param {string} pathname - Ruta solicitada
 * @param {string} method - Método HTTP
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
function handleUserRoutes(pathname, method, req, res) {
  // GET /api/users - Lista todos los usuarios (solo admin)
  if (pathname === '/api/users' && method === 'GET') {
    if (!AuthMiddleware.requireAdmin(req, res)) return;
    UserController.list(req, res);
    return;
  }

  // POST /api/users - Crear usuario (solo admin)
  if (pathname === '/api/users' && method === 'POST') {
    if (!AuthMiddleware.requireAdmin(req, res)) return;
    UserController.create(req, res);
    return;
  }

  // GET /api/users/:id - Obtener un usuario específico (admin o el mismo usuario)
  const getUserMatch = pathname.match(/^\/api\/users\/(\d+)$/);
  if (getUserMatch && method === 'GET') {
    const userId = getUserMatch[1];
    if (!AuthMiddleware.requireAuth(req, res)) return;
    
    // Verificar que sea administrador o el propio usuario
    if (req.session.rol !== 'administrador' && req.session.userId !== parseInt(userId)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acceso denegado' }));
      return;
    }
    UserController.getById(req, res, userId);
    return;
  }

  // PUT /api/users/:id - Actualizar usuario (solo admin)
  const updateUserMatch = pathname.match(/^\/api\/users\/(\d+)$/);
  if (updateUserMatch && method === 'PUT') {
    const userId = updateUserMatch[1];
    if (!AuthMiddleware.requireAdmin(req, res)) return;
    UserController.update(req, res, userId);
    return;
  }

  // PATCH /api/users/:id/status - Cambiar estado (solo admin)
  const statusMatch = pathname.match(/^\/api\/users\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const userId = statusMatch[1];
    if (!AuthMiddleware.requireAdmin(req, res)) return;
    UserController.changeStatus(req, res, userId);
    return;
  }

  // PATCH /api/users/:id/password - Cambiar contraseña (solo admin)
  const passwordMatch = pathname.match(/^\/api\/users\/(\d+)\/password$/);
  if (passwordMatch && method === 'PATCH') {
    const userId = passwordMatch[1];
    if (!AuthMiddleware.requireAdmin(req, res)) return;
    UserController.changePassword(req, res, userId);
    return;
  }

  // GET /api/roles - Obtener todos los roles (autenticado)
  if (pathname === '/api/roles' && method === 'GET') {
    if (!AuthMiddleware.requireAuth(req, res)) return;
    UserController.getRoles(req, res);
    return;
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
}

module.exports = handleUserRoutes;
