/**
 * RUTAS DE FASES - AGROTECHNOVA
 * 
 * Mapea endpoints HTTP a controladores de fases.
 * 
 * Endpoints:
 * - GET    /api/projects/:projectId/phases  → Lista fases del proyecto (RF13)
 * - GET    /api/projects/:projectId/progress → Progreso del proyecto
 * - POST   /api/projects/:projectId/phases  → Crea fase (RF13)
 * - GET    /api/phases/:id                  → Obtiene fase
 * - PUT    /api/phases/:id                  → Actualiza fase
 * - DELETE /api/phases/:id                  → Elimina fase
 */

const PhaseController = require('../controllers/phaseController');
const authMiddleware = require('../middlewares/authMiddleware');

function handlePhaseRoutes(req, res) {
  const { method, url } = req;
  const urlObj = new URL(url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Middleware de autenticación
  if (!authMiddleware.requireAuth(req, res)) return;

  // GET /api/projects/:projectId/progress (RF13)
  if (method === 'GET' && pathname.match(/^\/api\/projects\/\d+\/progress$/)) {
    const projectId = pathname.split('/')[3];
    return PhaseController.getProjectProgress(req, res, projectId);
  }

  // GET /api/projects/:projectId/phases (RF13)
  if (method === 'GET' && pathname.match(/^\/api\/projects\/\d+\/phases$/)) {
    const projectId = pathname.split('/')[3];
    return PhaseController.listByProject(req, res, projectId);
  }

  // POST /api/projects/:projectId/phases (RF13)
  if (method === 'POST' && pathname.match(/^\/api\/projects\/\d+\/phases$/)) {
    const projectId = pathname.split('/')[3];
    return PhaseController.create(req, res, projectId);
  }

  // GET /api/phases/:id
  if (method === 'GET' && pathname.match(/^\/api\/phases\/\d+$/)) {
    const id = pathname.split('/').pop();
    return PhaseController.getById(req, res, id);
  }

  // PUT /api/phases/:id
  if (method === 'PUT' && pathname.match(/^\/api\/phases\/\d+$/)) {
    const id = pathname.split('/').pop();
    return PhaseController.update(req, res, id);
  }

  // DELETE /api/phases/:id
  if (method === 'DELETE' && pathname.match(/^\/api\/phases\/\d+$/)) {
    const id = pathname.split('/').pop();
    return PhaseController.delete(req, res, id);
  }

  // 404 - Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta de fases no encontrada' }));
}

module.exports = { handlePhaseRoutes };
