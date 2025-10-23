const BudgetController = require('../controllers/budgetController');
const authMiddleware = require('../middlewares/authMiddleware');

function handleBudgetRoutes(req, res, urlParts) {
  if (!authMiddleware.requireAuth(req, res)) {
    return;
  }

  const method = req.method;

  // POST /api/budget - Crear presupuesto
  if (method === 'POST' && urlParts.length === 2) {
    return BudgetController.create(req, res);
  }

  // GET /api/budget - Obtener todos los presupuestos
  if (method === 'GET' && urlParts.length === 2) {
    return BudgetController.getAll(req, res);
  }

  // GET /api/budget/:id - Obtener presupuesto por ID
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] !== 'project' && urlParts[2] !== 'status' && urlParts[2] !== 'check') {
    return BudgetController.getById(req, res, urlParts[2]);
  }

  // GET /api/budget/project/:proyecto_id - Obtener presupuesto por proyecto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'project') {
    return BudgetController.getByProject(req, res, urlParts[3]);
  }

  // GET /api/budget/status/:proyecto_id - Obtener estado del presupuesto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'status') {
    return BudgetController.getStatus(req, res, urlParts[3]);
  }

  // GET /api/budget/check/:proyecto_id/:monto - Verificar disponibilidad
  if (method === 'GET' && urlParts.length === 5 && urlParts[2] === 'check') {
    return BudgetController.checkAvailability(req, res, urlParts[3], urlParts[4]);
  }

  // PUT /api/budget/:id - Actualizar presupuesto
  if (method === 'PUT' && urlParts.length === 3) {
    return BudgetController.update(req, res, urlParts[2]);
  }

  // DELETE /api/budget/:id - Eliminar presupuesto
  if (method === 'DELETE' && urlParts.length === 3) {
    return BudgetController.delete(req, res, urlParts[2]);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}

module.exports = handleBudgetRoutes;
