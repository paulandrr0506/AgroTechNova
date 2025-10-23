const ResourceController = require('../controllers/resourceController');
const authMiddleware = require('../middlewares/authMiddleware');

function handleResourceRoutes(req, res, urlParts) {
  if (!authMiddleware.requireAuth(req, res)) {
    return;
  }

  const method = req.method;

  // POST /api/resources - Crear recurso
  if (method === 'POST' && urlParts.length === 2) {
    return ResourceController.create(req, res);
  }

  // GET /api/resources - Obtener todos los recursos
  if (method === 'GET' && urlParts.length === 2) {
    return ResourceController.getAll(req, res);
  }

  // GET /api/resources/:id - Obtener recurso por ID
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] !== 'project' && urlParts[2] !== 'phase' && urlParts[2] !== 'stats') {
    return ResourceController.getById(req, res, urlParts[2]);
  }

  // GET /api/resources/project/:proyecto_id - Obtener recursos por proyecto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'project') {
    return ResourceController.getByProject(req, res, urlParts[3]);
  }

  // GET /api/resources/phase/:fase_id - Obtener recursos por fase
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'phase') {
    return ResourceController.getByPhase(req, res, urlParts[3]);
  }

  // GET /api/resources/stats/:proyecto_id - Obtener estadísticas por proyecto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'stats') {
    return ResourceController.getStats(req, res, urlParts[3]);
  }

  // PUT /api/resources/:id - Actualizar recurso
  if (method === 'PUT' && urlParts.length === 3) {
    return ResourceController.update(req, res, urlParts[2]);
  }

  // DELETE /api/resources/:id - Eliminar recurso
  if (method === 'DELETE' && urlParts.length === 3) {
    return ResourceController.delete(req, res, urlParts[2]);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}

module.exports = handleResourceRoutes;
