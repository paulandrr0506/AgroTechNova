/**
 * RUTAS: Inventario (Sprint 4 - RF08, RF09, RF43)
 */

const InventoryController = require('../controllers/inventoryController');

function handleInventoryRoutes(req, res, method, pathname, urlParts) {
  // POST /api/inventory/entrada - Registrar entrada (RF43)
  if (method === 'POST' && urlParts.length === 3 && urlParts[2] === 'entrada') {
    return InventoryController.registrarEntrada(req, res);
  }

  // POST /api/inventory/salida - Registrar salida (RF43)
  if (method === 'POST' && urlParts.length === 3 && urlParts[2] === 'salida') {
    return InventoryController.registrarSalida(req, res);
  }

  // GET /api/inventory - Obtener todos los movimientos (RF08)
  if (method === 'GET' && urlParts.length === 2) {
    return InventoryController.getAllMovimientos(req, res);
  }

  // GET /api/inventory/estadisticas - Obtener estadísticas (RF05)
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'estadisticas') {
    return InventoryController.getEstadisticas(req, res);
  }

  // GET /api/inventory/producto/:producto_id - Obtener movimientos por producto (RF08)
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'producto' && urlParts[3]) {
    req.params = { producto_id: urlParts[3] };
    return InventoryController.getMovimientosByProducto(req, res);
  }

  // GET /api/inventory/proyecto/:proyecto_id - Obtener movimientos por proyecto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'proyecto' && urlParts[3]) {
    req.params = { proyecto_id: urlParts[3] };
    return InventoryController.getMovimientosByProyecto(req, res);
  }

  // GET /api/inventory/tipo/:tipo - Obtener movimientos por tipo (RF09)
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'tipo' && urlParts[3]) {
    req.params = { tipo: urlParts[3] };
    return InventoryController.getMovimientosByTipo(req, res);
  }

  // GET /api/inventory/fecha-range?fecha_inicio=...&fecha_fin=... - Obtener por rango de fechas (RF09)
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'fecha-range') {
    return InventoryController.getMovimientosByDateRange(req, res);
  }

  // GET /api/inventory/resumen/:producto_id - Obtener resumen por producto
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'resumen' && urlParts[3]) {
    req.params = { producto_id: urlParts[3] };
    return InventoryController.getResumenByProducto(req, res);
  }

  // DELETE /api/inventory/:id - Eliminar movimiento
  if (method === 'DELETE' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return InventoryController.deleteMovimiento(req, res);
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Ruta no encontrada' }));
}

module.exports = handleInventoryRoutes;
