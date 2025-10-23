/**
 * CONTROLADOR DE PANEL ADMINISTRATIVO - AGROTECHNOVA
 * 
 * Panel de control para administradores del sistema.
 * 
 * Cumple con:
 * - RF36: Panel administrativo avanzado
 * - RNF18: Monitoreo del sistema
 */

const LogModel = require('../models/logModel');
const TicketModel = require('../models/ticketModel');
const db = require('../db/database');
const AuthMiddleware = require('../middlewares/authMiddleware');

class AdminController {
  /**
   * Obtener métricas generales del sistema
   */
  static async metricas(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      console.log('🔍 DEBUG adminController.metricas - Sesión:', sesion);

      if (!sesion || sesion.rol !== 'administrador') {
        console.log('❌ Acceso denegado. Rol:', sesion?.rol);
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden acceder al panel'
        }));
        return;
      }

      console.log('✅ Acceso permitido. Obteniendo métricas...');

      // Obtener estadísticas de múltiples módulos
      const [
        usuariosStats,
        proyectosStats,
        ticketsStats,
        logsStats
      ] = await Promise.all([
        AdminController._getUsuariosStats(),
        AdminController._getProyectosStats(),
        TicketModel.getEstadisticas(),
        LogModel.getEstadisticas('24h')
      ]);

      console.log('✅ Métricas obtenidas exitosamente');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          usuarios: usuariosStats,
          proyectos: proyectosStats,
          tickets: ticketsStats,
          logs: logsStats,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('❌ Error al obtener métricas:', error);
      console.error('Stack:', error.stack);
      
      const sesion = AuthMiddleware.extractSession(req);
      await LogModel.logError('admin', 'Error al obtener métricas del sistema', error, sesion?.userId);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener las métricas'
      }));
    }
  }

  /**
   * Obtener actividad reciente del sistema
   */
  static async actividadReciente(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden acceder al panel'
        }));
        return;
      }

      const { limit } = req.query || {};
      const logs = await LogModel.getRecientes(limit ? parseInt(limit) : 20);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: logs
      }));
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo obtener la actividad reciente'
      }));
    }
  }

  /**
   * Obtener información del sistema
   */
  static async infoSistema(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden acceder al panel'
        }));
        return;
      }

      const sistemaInfo = {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoria: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          usado: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
        },
        timestamp: new Date().toISOString()
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: sistemaInfo
      }));
    } catch (error) {
      console.error('Error al obtener info del sistema:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudo obtener la información del sistema'
      }));
    }
  }

  /**
   * Obtener estadísticas de base de datos
   */
  static async estadisticasDB(req, res) {
    try {
      // Extraer sesión
      const sesion = AuthMiddleware.extractSession(req);

      if (!sesion || sesion.rol !== 'administrador') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Acceso denegado',
          message: 'Solo administradores pueden acceder al panel'
        }));
        return;
      }

      const tablas = [
        'usuarios', 'roles', 'proyectos', 'fases', 'hitos',
        'recursos', 'presupuestos', 'gastos', 'tareas',
        'proveedores', 'productos', 'movimientos_inventario',
        'tickets', 'logs_sistema'
      ];

      const stats = {};

      for (const tabla of tablas) {
        try {
          const result = await db.get(`SELECT COUNT(*) as count FROM ${tabla}`);
          stats[tabla] = result.count;
        } catch (error) {
          stats[tabla] = 0;
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          tablas: stats,
          total_registros: Object.values(stats).reduce((a, b) => a + b, 0)
        }
      }));
    } catch (error) {
      console.error('Error al obtener estadísticas de DB:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Error interno',
        message: 'No se pudieron obtener las estadísticas'
      }));
    }
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Obtener estadísticas de usuarios
   */
  static async _getUsuariosStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) as inactivos,
        COUNT(DISTINCT rol_id) as roles_unicos
      FROM usuarios
    `;

    try {
      const stats = await db.get(sql);
      return stats;
    } catch (error) {
      console.error('Error al obtener stats de usuarios:', error);
      return { total: 0, activos: 0, inactivos: 0, roles_unicos: 0 };
    }
  }

  /**
   * Obtener estadísticas de proyectos
   */
  static async _getProyectosStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'planificacion' THEN 1 ELSE 0 END) as en_planificacion,
        SUM(CASE WHEN estado = 'ejecucion' THEN 1 ELSE 0 END) as en_ejecucion,
        SUM(CASE WHEN estado = 'finalizado' THEN 1 ELSE 0 END) as finalizados,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
      FROM proyectos
    `;

    try {
      const stats = await db.get(sql);
      return stats;
    } catch (error) {
      console.error('Error al obtener stats de proyectos:', error);
      return { total: 0, en_planificacion: 0, en_ejecucion: 0, finalizados: 0, cancelados: 0 };
    }
  }
}

module.exports = AdminController;
