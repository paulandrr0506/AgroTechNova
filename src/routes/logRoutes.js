/**
 * RUTAS DE LOGS - AGROTECHNOVA
 * 
 * Manejo de logs del sistema.
 * 
 * Cumple con:
 * - RF37: Monitoreo de la infraestructura
 * - RF46: Visualización y gestión de logs del sistema
 */

const LogController = require('../controllers/logController');
const { parseBody } = require('../utils/validators');

/**
 * Manejador principal de rutas de logs
 */
async function handleLogRoutes(req, res, parsedUrl) {
  const method = req.method;
  const pathname = parsedUrl.pathname;

  try {
    // GET /api/logs - Listar logs con filtros
    if (pathname === '/api/logs' && method === 'GET') {
      req.query = parsedUrl.query;
      return await LogController.listar(req, res);
    }

    // GET /api/logs/estadisticas - Estadísticas de logs
    if (pathname === '/api/logs/estadisticas' && method === 'GET') {
      req.query = parsedUrl.query;
      return await LogController.estadisticas(req, res);
    }

    // GET /api/logs/recientes - Logs recientes
    if (pathname === '/api/logs/recientes' && method === 'GET') {
      req.query = parsedUrl.query;
      return await LogController.recientes(req, res);
    }

    // POST /api/logs/limpiar - Limpiar logs antiguos
    if (pathname === '/api/logs/limpiar' && method === 'POST') {
      req.body = await parseBody(req);
      return await LogController.limpiar(req, res);
    }

    // GET /api/logs/:id - Obtener log por ID
    if (pathname.match(/^\/api\/logs\/\d+$/) && method === 'GET') {
      req.params = { id: pathname.split('/')[3] };
      return await LogController.obtenerPorId(req, res);
    }

    // Ruta no encontrada
    return false;
  } catch (error) {
    console.error('Error en rutas de logs:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Error interno',
      message: 'Error al procesar la solicitud'
    }));
    return true;
  }
}

module.exports = handleLogRoutes;
