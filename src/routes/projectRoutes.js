/**
 * RUTAS DE PROYECTOS - AGROTECHNOVA
 * 
 * Mapea endpoints HTTP a controladores de proyectos.
 * 
 * Endpoints:
 * - GET    /api/projects                    → Lista proyectos
 * - GET    /api/projects/search             → Busca proyectos (RF62)
 * - GET    /api/projects/categories         → Lista categorías (RF23)
 * - GET    /api/projects/my-projects        → Proyectos del usuario
 * - GET    /api/projects/:id                → Obtiene proyecto
 * - POST   /api/projects                    → Crea proyecto (RF41)
 * - PUT    /api/projects/:id                → Actualiza proyecto (RF15)
 * - DELETE /api/projects/:id                → Elimina proyecto
 */

const ProjectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

function handleProjectRoutes(req, res) {
  const { method, url } = req;
  const urlObj = new URL(url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Middleware de autenticación (requiere sesión activa)
  if (!authMiddleware.requireAuth(req, res)) return;

  // GET /api/projects/categories
  if (method === 'GET' && pathname === '/api/projects/categories') {
    return ProjectController.getCategories(req, res);
  }

  // GET /api/projects/search (RF62)
  if (method === 'GET' && pathname === '/api/projects/search') {
    return ProjectController.search(req, res);
  }

  // GET /api/projects/my-projects
  if (method === 'GET' && pathname === '/api/projects/my-projects') {
    return ProjectController.getMyProjects(req, res);
  }

  // GET /api/projects/:id
  if (method === 'GET' && pathname.match(/^\/api\/projects\/\d+$/)) {
    const id = pathname.split('/').pop();
    return ProjectController.getById(req, res, id);
  }

  // GET /api/projects
  if (method === 'GET' && pathname === '/api/projects') {
    return ProjectController.list(req, res);
  }

  // POST /api/projects (RF41)
  if (method === 'POST' && pathname === '/api/projects') {
    return ProjectController.create(req, res);
  }

  // PUT /api/projects/:id (RF15)
  if (method === 'PUT' && pathname.match(/^\/api\/projects\/\d+$/)) {
    const id = pathname.split('/').pop();
    return ProjectController.update(req, res, id);
  }

  // DELETE /api/projects/:id
  if (method === 'DELETE' && pathname.match(/^\/api\/projects\/\d+$/)) {
    const id = pathname.split('/').pop();
    return ProjectController.delete(req, res, id);
  }

  // 404 - Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta de proyectos no encontrada' }));
}

module.exports = { handleProjectRoutes };
