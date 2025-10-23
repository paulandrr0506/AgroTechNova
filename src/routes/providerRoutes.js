/**
 * RUTAS: Proveedores (Sprint 4 - RF16, RF18)
 */

const ProviderController = require('../controllers/providerController');

function handleProviderRoutes(req, res, method, pathname, urlParts) {
  // POST /api/providers - Crear proveedor (RF16)
  if (method === 'POST' && urlParts.length === 2) {
    return ProviderController.create(req, res);
  }

  // GET /api/providers - Obtener todos los proveedores
  if (method === 'GET' && urlParts.length === 2) {
    return ProviderController.getAll(req, res);
  }

  // GET /api/providers/active - Obtener proveedores activos (RF18)
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'active') {
    return ProviderController.getActive(req, res);
  }

  // GET /api/providers/:id - Obtener proveedor por ID
  if (method === 'GET' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProviderController.getById(req, res);
  }

  // PUT /api/providers/:id - Actualizar proveedor
  if (method === 'PUT' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProviderController.update(req, res);
  }

  // PATCH /api/providers/:id/deactivate - Desactivar proveedor
  if (method === 'PATCH' && urlParts.length === 4 && urlParts[2] && urlParts[3] === 'deactivate') {
    req.params = { id: urlParts[2] };
    return ProviderController.deactivate(req, res);
  }

  // PATCH /api/providers/:id/activate - Activar proveedor
  if (method === 'PATCH' && urlParts.length === 4 && urlParts[2] && urlParts[3] === 'activate') {
    req.params = { id: urlParts[2] };
    return ProviderController.activate(req, res);
  }

  // DELETE /api/providers/:id - Eliminar proveedor
  if (method === 'DELETE' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProviderController.delete(req, res);
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Ruta no encontrada' }));
}

module.exports = handleProviderRoutes;
