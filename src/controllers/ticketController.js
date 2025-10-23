/**
 * CONTROLADOR DE TICKETS - AGROTECHNOVA
 * 
 * Gestión de tickets de soporte.
 * 
 * Cumple con:
 * - RF34: Programación de reuniones o asesorías virtuales
 */

const TicketModel = require('../models/ticketModel');
const LogModel = require('../models/logModel');
const AuthMiddleware = require('../middlewares/authMiddleware');

class TicketController {
  /**
   * Crear un nuevo ticket
   */
  static async crear(req, res) {
    try {
      const { asunto, descripcion, prioridad, proyecto_id } = req.body;
      
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);
      const usuario_id = sesion?.userId;

      if (!usuario_id) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión para crear un ticket'
        }));
        return;
      }

      if (!asunto || !descripcion) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Datos incompletos',
          message: 'El asunto y la descripción son obligatorios'
        }));
        return;
      }

      const ticket = await TicketModel.create({
        usuario_id,
        asunto,
        descripcion,
        prioridad: prioridad || 'media',
        proyecto_id
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Ticket creado exitosamente',
        data: ticket
      }));
    } catch (error) {
      console.error('Error al crear ticket:', error);
      await LogModel.logError('tickets', 'Error al crear ticket', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo crear el ticket'
      }));
    }
  }

  /**
   * Listar todos los tickets (con filtros)
   */
  static async listar(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      req.session = sesion;

      const { estado, prioridad, usuario_id, asignado_id } = req.query || {};
      const filters = {};

      // Si no es admin, solo ver sus propios tickets
      if (sesion.rol !== 'administrador') {
        filters.usuario_id = sesion.userId;
      } else {
        // Admin puede filtrar por usuario
        if (usuario_id) filters.usuario_id = parseInt(usuario_id);
        if (asignado_id) filters.asignado_id = parseInt(asignado_id);
      }

      if (estado) filters.estado = estado;
      if (prioridad) filters.prioridad = prioridad;

      const tickets = await TicketModel.findAll(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: tickets
      }));
    } catch (error) {
      console.error('Error al listar tickets:', error);
      await LogModel.logError('tickets', 'Error al listar tickets', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener los tickets'
      }));
    }
  }

  /**
   * Obtener un ticket por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      const ticket = await TicketModel.findById(id);

      if (!ticket) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No encontrado',
          message: 'Ticket no encontrado'
        }));
        return;
      }

      // Verificar permisos
      if (sesion.rol !== 'administrador' && ticket.usuario_id !== sesion.userId) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'No tiene permisos para ver este ticket'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: ticket
      }));
    } catch (error) {
      console.error('Error al obtener ticket:', error);
      await LogModel.logError('tickets', 'Error al obtener ticket', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo obtener el ticket'
      }));
    }
  }

  /**
   * Actualizar estado del ticket
   */
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      if (!estado) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Datos incompletos',
          message: 'El estado es obligatorio'
        }));
        return;
      }

      // Verificar permisos (solo admin o dueño del ticket)
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No encontrado',
          message: 'Ticket no encontrado'
        }));
        return;
      }

      if (sesion.rol !== 'administrador' && ticket.usuario_id !== sesion.userId) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'No tiene permisos para modificar este ticket'
        }));
        return;
      }

      const result = await TicketModel.updateEstado(id, estado, sesion.userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: result
      }));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      await LogModel.logError('tickets', 'Error al actualizar estado del ticket', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: error.message || 'No se pudo actualizar el estado'
      }));
    }
  }

  /**
   * Asignar ticket a un usuario (solo admin)
   */
  static async asignar(req, res) {
    try {
      const { id } = req.params;
      const { asignado_id } = req.body;
      
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      // Solo admin puede asignar
      if (sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden asignar tickets'
        }));
        return;
      }

      if (!asignado_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Datos incompletos',
          message: 'El ID del usuario asignado es obligatorio'
        }));
        return;
      }

      const result = await TicketModel.asignar(id, asignado_id, sesion.userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Ticket asignado exitosamente',
        data: result
      }));
    } catch (error) {
      console.error('Error al asignar ticket:', error);
      await LogModel.logError('tickets', 'Error al asignar ticket', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo asignar el ticket'
      }));
    }
  }

  /**
   * Obtener estadísticas de tickets (solo admin)
   */
  static async estadisticas(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      if (sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden ver estadísticas'
        }));
        return;
      }

      const stats = await TicketModel.getEstadisticas();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: stats
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      await LogModel.logError('tickets', 'Error al obtener estadísticas de tickets', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener las estadísticas'
      }));
    }
  }

  /**
   * Eliminar un ticket (solo admin)
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || !sesion.userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No autenticado',
          message: 'Debe iniciar sesión'
        }));
        return;
      }

      if (sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden eliminar tickets'
        }));
        return;
      }

      await TicketModel.delete(id, sesion.userId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Ticket eliminado exitosamente'
      }));
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      await LogModel.logError('tickets', 'Error al eliminar ticket', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo eliminar el ticket'
      }));
    }
  }
}

module.exports = TicketController;
