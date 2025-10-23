/**
 * MODELO DE TICKETS - AGROTECHNOVA
 * 
 * Gestión de tickets de soporte técnico.
 * 
 * Cumple con:
 * - RF34: Programación de reuniones o asesorías virtuales
 * - RF11: Solicitud de asesoría técnica
 */

const db = require('../db/database');

class TicketModel {
  /**
   * Crea la tabla de tickets
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        prioridad VARCHAR(20) DEFAULT 'media',
        estado VARCHAR(20) DEFAULT 'abierto',
        asignado_id INTEGER,
        proyecto_id INTEGER,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre DATETIME,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL
      )
    `;

    try {
      await db.run(sql);
      console.log('✅ Tabla "tickets" creada correctamente');
    } catch (error) {
      console.error('❌ Error al crear tabla tickets:', error.message);
      throw error;
    }
  }

  /**
   * Crear un nuevo ticket
   */
  static async create(ticketData) {
    const { usuario_id, asunto, descripcion, prioridad = 'media', proyecto_id = null } = ticketData;

    const sql = `
      INSERT INTO tickets (usuario_id, asunto, descripcion, prioridad, proyecto_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const result = await db.run(sql, [usuario_id, asunto, descripcion, prioridad, proyecto_id]);
      
      // Registrar log
      const LogModel = require('./logModel');
      await LogModel.create({
        nivel: 'info',
        origen: 'tickets',
        mensaje: `Nuevo ticket creado: ${asunto}`,
        usuario_id,
        meta: JSON.stringify({ ticket_id: result.lastID, prioridad })
      });

      return { id: result.lastID, ...ticketData, estado: 'abierto' };
    } catch (error) {
      console.error('❌ Error al crear ticket:', error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los tickets (con filtros opcionales)
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        t.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.nombre as asignado_nombre,
        p.nombre as proyecto_nombre
      FROM tickets t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.estado) {
      sql += ' AND t.estado = ?';
      params.push(filters.estado);
    }

    if (filters.prioridad) {
      sql += ' AND t.prioridad = ?';
      params.push(filters.prioridad);
    }

    if (filters.usuario_id) {
      sql += ' AND t.usuario_id = ?';
      params.push(filters.usuario_id);
    }

    if (filters.asignado_id) {
      sql += ' AND t.asignado_id = ?';
      params.push(filters.asignado_id);
    }

    sql += ' ORDER BY t.fecha_creacion DESC';

    try {
      const tickets = await db.all(sql, params);
      return tickets;
    } catch (error) {
      console.error('❌ Error al obtener tickets:', error.message);
      throw error;
    }
  }

  /**
   * Obtener un ticket por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        t.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        a.nombre as asignado_nombre,
        a.email as asignado_email,
        p.nombre as proyecto_nombre
      FROM tickets t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ?
    `;

    try {
      const ticket = await db.get(sql, [id]);
      return ticket;
    } catch (error) {
      console.error('❌ Error al obtener ticket:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar estado del ticket
   */
  static async updateEstado(id, estado, usuario_id = null) {
    const validEstados = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];
    
    if (!validEstados.includes(estado)) {
      throw new Error('Estado inválido');
    }

    const fecha_cierre = (estado === 'resuelto' || estado === 'cerrado') ? new Date().toISOString() : null;

    const sql = `
      UPDATE tickets 
      SET estado = ?, fecha_cierre = ?
      WHERE id = ?
    `;

    try {
      await db.run(sql, [estado, fecha_cierre, id]);

      // Registrar log
      const LogModel = require('./logModel');
      await LogModel.create({
        nivel: 'info',
        origen: 'tickets',
        mensaje: `Ticket #${id} cambió a estado: ${estado}`,
        usuario_id,
        meta: JSON.stringify({ ticket_id: id, nuevo_estado: estado })
      });

      return { id, estado, fecha_cierre };
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error.message);
      throw error;
    }
  }

  /**
   * Asignar ticket a un usuario
   */
  static async asignar(id, asignado_id, usuario_admin_id = null) {
    const sql = `UPDATE tickets SET asignado_id = ? WHERE id = ?`;

    try {
      await db.run(sql, [asignado_id, id]);

      // Registrar log
      const LogModel = require('./logModel');
      await LogModel.create({
        nivel: 'info',
        origen: 'tickets',
        mensaje: `Ticket #${id} asignado a usuario #${asignado_id}`,
        usuario_id: usuario_admin_id,
        meta: JSON.stringify({ ticket_id: id, asignado_id })
      });

      return { id, asignado_id };
    } catch (error) {
      console.error('❌ Error al asignar ticket:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de tickets
   */
  static async getEstadisticas() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
        SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as alta_prioridad,
        SUM(CASE WHEN prioridad = 'media' THEN 1 ELSE 0 END) as media_prioridad,
        SUM(CASE WHEN prioridad = 'baja' THEN 1 ELSE 0 END) as baja_prioridad
      FROM tickets
    `;

    try {
      const stats = await db.get(sql);
      return stats;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar un ticket
   */
  static async delete(id, usuario_id = null) {
    const sql = `DELETE FROM tickets WHERE id = ?`;

    try {
      await db.run(sql, [id]);

      // Registrar log
      const LogModel = require('./logModel');
      await LogModel.create({
        nivel: 'warn',
        origen: 'tickets',
        mensaje: `Ticket #${id} eliminado`,
        usuario_id,
        meta: JSON.stringify({ ticket_id: id })
      });

      return { id };
    } catch (error) {
      console.error('❌ Error al eliminar ticket:', error.message);
      throw error;
    }
  }
}

module.exports = TicketModel;
