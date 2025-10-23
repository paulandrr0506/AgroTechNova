/**
 * CONTROLADOR DE LOGS - AGROTECHNOVA
 * 
 * Gestión y visualización de logs del sistema.
 * 
 * Cumple con:
 * - RF37: Monitoreo de la infraestructura
 * - RF46: Visualización y gestión de logs del sistema
 */

const LogModel = require('../models/logModel');
const AuthMiddleware = require('../middlewares/authMiddleware');

class LogController {
  /**
   * Listar logs con filtros
   */
  static async listar(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      console.log('🔍 DEBUG logController.listar - Sesión:', sesion);

      // Solo admin puede ver logs
      if (!sesion || sesion.rol !== 'administrador') {
        console.log('❌ Acceso denegado. Rol:', sesion?.rol);
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden ver los logs del sistema'
        }));
        return;
      }

      const { nivel, origen, fecha_inicio, fecha_fin, usuario_id, limit } = req.query || {};

      const filters = {};
      if (nivel) filters.nivel = nivel;
      if (origen) filters.origen = origen;
      if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
      if (fecha_fin) filters.fecha_fin = fecha_fin;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);
      if (limit) filters.limit = parseInt(limit);

      const logs = await LogModel.findAll(filters);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: logs
      }));
    } catch (error) {
      console.error('Error al listar logs:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener los logs'
      }));
    }
  }

  /**
   * Obtener un log por ID
   */
  static async obtenerPorId(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden ver los logs del sistema'
        }));
        return;
      }

      const { id } = req.params;
      const log = await LogModel.findById(id);

      if (!log) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'No encontrado',
          message: 'Log no encontrado'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: log
      }));
    } catch (error) {
      console.error('Error al obtener log:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo obtener el log'
      }));
    }
  }

  /**
   * Obtener estadísticas de logs
   */
  static async estadisticas(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden ver estadísticas'
        }));
        return;
      }

      const { periodo } = req.query || {};
      const stats = await LogModel.getEstadisticas(periodo || '24h');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: stats
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener las estadísticas'
      }));
    }
  }

  /**
   * Obtener logs recientes
   */
  static async recientes(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden ver los logs'
        }));
        return;
      }

      const { limit } = req.query || {};
      const logs = await LogModel.getRecientes(limit ? parseInt(limit) : 50);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: logs
      }));
    } catch (error) {
      console.error('Error al obtener logs recientes:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener los logs recientes'
      }));
    }
  }

  /**
   * Limpiar logs antiguos
   */
  static async limpiar(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden limpiar logs'
        }));
        return;
      }

      const { dias } = req.body;
      const result = await LogModel.limpiarAntiguos(dias || 90);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Logs antiguos limpiados exitosamente',
        data: result
      }));
    } catch (error) {
      console.error('Error al limpiar logs:', error);
      await LogModel.logError('logs', 'Error al limpiar logs antiguos', error, req.session?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron limpiar los logs'
      }));
    }
  }
}

module.exports = LogController;
