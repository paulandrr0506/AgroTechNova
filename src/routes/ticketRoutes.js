/**
 * RUTAS DE TICKETS - AGROTECHNOVA
 * 
 * Manejo de tickets de soporte.
 * 
 * Cumple con:
 * - RF34: Programación de reuniones o asesorías virtuales
 */

const TicketController = require('../controllers/ticketController');
const { parseBody } = require('../utils/validators');

/**
 * Manejador principal de rutas de tickets
 */
async function handleTicketRoutes(req, res, parsedUrl) {
  const method = req.method;
  const pathname = parsedUrl.pathname;

  try {
    // POST /api/tickets - Crear ticket
    if (pathname === '/api/tickets' && method === 'POST') {
      req.body = await parseBody(req);
      return await TicketController.crear(req, res);
    }

    // GET /api/tickets - Listar tickets
    if (pathname === '/api/tickets' && method === 'GET') {
      req.query = parsedUrl.query;
      return await TicketController.listar(req, res);
    }

    // GET /api/tickets/estadisticas - Estadísticas
    if (pathname === '/api/tickets/estadisticas' && method === 'GET') {
      req.query = parsedUrl.query;
      return await TicketController.estadisticas(req, res);
    }

    // GET /api/tickets/:id - Obtener ticket por ID
    if (pathname.match(/^\/api\/tickets\/\d+$/) && method === 'GET') {
      req.params = { id: pathname.split('/')[3] };
      return await TicketController.obtenerPorId(req, res);
    }

    // PUT /api/tickets/:id/estado - Actualizar estado
    if (pathname.match(/^\/api\/tickets\/\d+\/estado$/) && method === 'PUT') {
      req.params = { id: pathname.split('/')[3] };
      req.body = await parseBody(req);
      return await TicketController.actualizarEstado(req, res);
    }

    // PUT /api/tickets/:id/asignar - Asignar ticket
    if (pathname.match(/^\/api\/tickets\/\d+\/asignar$/) && method === 'PUT') {
      req.params = { id: pathname.split('/')[3] };
      req.body = await parseBody(req);
      return await TicketController.asignar(req, res);
    }

    // DELETE /api/tickets/:id - Eliminar ticket
    if (pathname.match(/^\/api\/tickets\/\d+$/) && method === 'DELETE') {
      req.params = { id: pathname.split('/')[3] };
      return await TicketController.eliminar(req, res);
    }

    // Ruta no encontrada
    return false;
  } catch (error) {
    console.error('Error en rutas de tickets:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Error interno',
      message: 'Error al procesar la solicitud'
    }));
    return true;
  }
}

module.exports = handleTicketRoutes;
