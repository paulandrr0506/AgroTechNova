const ExpenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

function handleExpenseRoutes(req, res, urlParts) {
  if (!authMiddleware.requireAuth(req, res)) {
    return;
  }

  const method = req.method;

  // POST /api/expenses - Crear gasto
  if (method === 'POST' && urlParts.length === 2) {
    return ExpenseController.create(req, res);
  }

  // GET /api/expenses - Obtener todos los gastos
  if (method === 'GET' && urlParts.length === 2) {
    return ExpenseController.getAll(req, res);
  }

  // GET /api/expenses/:id - Obtener gasto por ID
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] !== 'project' && urlParts[2] !== 'stats') {
    return ExpenseController.getById(req, res, urlParts[2]);
  }

  // GET /api/expenses/project/:proyecto_id - Obtener gastos por proyecto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'project') {
    return ExpenseController.getByProject(req, res, urlParts[3]);
  }

  // GET /api/expenses/stats/:proyecto_id - Obtener estadísticas de gastos
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'stats') {
    return ExpenseController.getStats(req, res, urlParts[3]);
  }

  // PUT /api/expenses/:id - Actualizar gasto
  if (method === 'PUT' && urlParts.length === 3) {
    return ExpenseController.update(req, res, urlParts[2]);
  }

  // DELETE /api/expenses/:id - Eliminar gasto
  if (method === 'DELETE' && urlParts.length === 3) {
    return ExpenseController.delete(req, res, urlParts[2]);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}

module.exports = handleExpenseRoutes;
