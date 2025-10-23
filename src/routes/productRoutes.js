/**
 * RUTAS: Productos (Sprint 4 - RF06, RF43, RF45)
 */

const ProductController = require('../controllers/productController');

function handleProductRoutes(req, res, method, pathname, urlParts) {
  // POST /api/products - Crear producto (RF06, RF43)
  if (method === 'POST' && urlParts.length === 2) {
    return ProductController.create(req, res);
  }

  // GET /api/products - Obtener todos los productos
  if (method === 'GET' && urlParts.length === 2) {
    return ProductController.getAll(req, res);
  }

  // GET /api/products/available - Obtener productos disponibles
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'available') {
    return ProductController.getAvailable(req, res);
  }

  // GET /api/products/organicos - Obtener productos orgánicos (RF45)
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'organicos') {
    return ProductController.getOrganicos(req, res);
  }

  // GET /api/products/low-stock - Obtener productos con stock bajo (RF04)
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'low-stock') {
    return ProductController.getLowStock(req, res);
  }

  // GET /api/products/total-value - Obtener valor total del inventario
  if (method === 'GET' && urlParts.length === 3 && urlParts[2] === 'total-value') {
    return ProductController.getTotalValue(req, res);
  }

  // GET /api/products/tipo/:tipo - Obtener productos por tipo
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'tipo' && urlParts[3]) {
    req.params = { tipo: urlParts[3] };
    return ProductController.getByTipo(req, res);
  }

  // GET /api/products/proveedor/:proveedor_id - Obtener productos por proveedor (RF18)
  if (method === 'GET' && urlParts.length === 4 && urlParts[2] === 'proveedor' && urlParts[3]) {
    req.params = { proveedor_id: urlParts[3] };
    return ProductController.getByProveedor(req, res);
  }

  // GET /api/products/:id - Obtener producto por ID
  if (method === 'GET' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProductController.getById(req, res);
  }

  // PUT /api/products/:id - Actualizar producto (RF43)
  if (method === 'PUT' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProductController.update(req, res);
  }

  // DELETE /api/products/:id - Eliminar producto (RF43)
  if (method === 'DELETE' && urlParts.length === 3 && urlParts[2]) {
    req.params = { id: urlParts[2] };
    return ProductController.delete(req, res);
  }

  // Ruta no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Ruta no encontrada' }));
}

module.exports = handleProductRoutes;
