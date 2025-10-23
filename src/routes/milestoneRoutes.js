/**
 * RUTAS DE HITOS - AGROTECHNOVA
 * 
 * Mapea endpoints HTTP a controladores de hitos.
 * 
 * Endpoints:
 * - GET    /api/phases/:phaseId/milestones   → Lista hitos de fase (RF25)
 * - POST   /api/phases/:phaseId/milestones   → Crea hito (RF25)
 * - GET    /api/projects/:projectId/milestones → Hitos del proyecto
 * - GET    /api/projects/:projectId/stats     → Estadísticas de hitos
 * - GET    /api/milestones/my-milestones      → Hitos del usuario
 * - GET    /api/milestones/:id                → Obtiene hito
 * - PUT    /api/milestones/:id                → Actualiza hito
 * - DELETE /api/milestones/:id                → Elimina hito
 */

const MilestoneController = require('../controllers/milestoneController');
const authMiddleware = require('../middlewares/authMiddleware');

function handleMilestoneRoutes(req, res) {
  const { method, url } = req;
  const urlObj = new URL(url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Middleware de autenticación
  if (!authMiddleware.requireAuth(req, res)) return;

  // GET /api/milestones/my-milestones
  if (method === 'GET' && pathname === '/api/milestones/my-milestones') {
    return MilestoneController.getMyMilestones(req, res);
  }

  // GET /api/projects/:projectId/stats (RF25)
  if (method === 'GET' && pathname.match(/^\/api\/projects\/\d+\/stats$/)) {
    const projectId = pathname.split('/')[3];
    return MilestoneController.getProjectStats(req, res, projectId);
  }

  // GET /api/projects/:projectId/milestones
  if (method === 'GET' && pathname.match(/^\/api\/projects\/\d+\/milestones$/)) {
    const projectId = pathname.split('/')[3];
    return MilestoneController.listByProject(req, res, projectId);
  }

  // GET /api/phases/:phaseId/milestones (RF25)
  if (method === 'GET' && pathname.match(/^\/api\/phases\/\d+\/milestones$/)) {
    const phaseId = pathname.split('/')[3];
    return MilestoneController.listByPhase(req, res, phaseId);
  }

  // POST /api/phases/:phaseId/milestones (RF25)
  if (method === 'POST' && pathname.match(/^\/api\/phases\/\d+\/milestones$/)) {
    const phaseId = pathname.split('/')[3];
    return MilestoneController.create(req, res, phaseId);
  }

  // GET /api/milestones/:id
  if (method === 'GET' && pathname.match(/^\/api\/milestones\/\d+$/)) {
    const id = pathname.split('/').pop();
    return MilestoneController.getById(req, res, id);
  }

  // PUT /api/milestones/:id
  if (method === 'PUT' && pathname.match(/^\/api\/milestones\/\d+$/)) {
    const id = pathname.split('/').pop();
    return MilestoneController.update(req, res, id);
  }

  // DELETE /api/milestones/:id
  if (method === 'DELETE' && pathname.match(/^\/api\/milestones\/\d+$/)) {
    const id = pathname.split('/').pop();
    return MilestoneController.delete(req, res, id);
  }

  // 404 - Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta de hitos no encontrada' }));
}

module.exports = { handleMilestoneRoutes };
