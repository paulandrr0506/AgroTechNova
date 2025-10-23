/**
 * RUTAS DE PANEL ADMINISTRATIVO - AGROTECHNOVA
 * 
 * Manejo del panel de administración.
 * 
 * Cumple con:
 * - RF36: Panel administrativo avanzado
 */

const AdminController = require('../controllers/adminController');

/**
 * Manejador principal de rutas de administración
 */
async function handleAdminRoutes(req, res, parsedUrl) {
  const method = req.method;
  const pathname = parsedUrl.pathname;

  try {
    // GET /api/admin/metricas - Métricas generales del sistema
    if (pathname === '/api/admin/metricas' && method === 'GET') {
      req.query = parsedUrl.query;
      return await AdminController.metricas(req, res);
    }

    // GET /api/admin/actividad - Actividad reciente
    if (pathname === '/api/admin/actividad' && method === 'GET') {
      req.query = parsedUrl.query;
      return await AdminController.actividadReciente(req, res);
    }

    // GET /api/admin/sistema - Información del sistema
    if (pathname === '/api/admin/sistema' && method === 'GET') {
      req.query = parsedUrl.query;
      return await AdminController.infoSistema(req, res);
    }

    // GET /api/admin/database - Estadísticas de base de datos
    if (pathname === '/api/admin/database' && method === 'GET') {
      req.query = parsedUrl.query;
      return await AdminController.estadisticasDB(req, res);
    }

    // Ruta no encontrada
    return false;
  } catch (error) {
    console.error('Error en rutas de admin:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Error interno',
      message: 'Error al procesar la solicitud'
    }));
    return true;
  }
}

module.exports = handleAdminRoutes;
