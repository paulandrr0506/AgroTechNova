/**
 * MODELO DE LOGS DEL SISTEMA - AGROTECHNOVA
 * 
 * Gestión de logs y monitoreo del sistema.
 * 
 * Cumple con:
 * - RF37: Monitoreo de la infraestructura
 * - RF46: Visualización y gestión de logs del sistema
 * - RNF18: Monitoreo del sistema
 */

const db = require('../db/database');

class LogModel {
  /**
   * Crea la tabla de logs del sistema
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS logs_sistema (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nivel VARCHAR(20) NOT NULL,
        origen VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        meta TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuario_id INTEGER,
        ip_address VARCHAR(50),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `;

    try {
      await db.run(sql);
      console.log('✅ Tabla "logs_sistema" creada correctamente');
    } catch (error) {
      console.error('❌ Error al crear tabla logs_sistema:', error.message);
      throw error;
    }
  }

  /**
   * Crear un nuevo log
   */
  static async create(logData) {
    const { 
      nivel, 
      origen, 
      mensaje, 
      usuario_id = null, 
      meta = null,
      ip_address = null 
    } = logData;

    // Validar nivel
    const nivelesValidos = ['info', 'warn', 'error', 'debug', 'critical'];
    if (!nivelesValidos.includes(nivel)) {
      throw new Error('Nivel de log inválido');
    }

    const sql = `
      INSERT INTO logs_sistema (nivel, origen, mensaje, usuario_id, meta, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = await db.run(sql, [
        nivel, 
        origen, 
        mensaje, 
        usuario_id, 
        typeof meta === 'string' ? meta : JSON.stringify(meta),
        ip_address
      ]);

      return { id: result.lastID, ...logData };
    } catch (error) {
      console.error('❌ Error al crear log:', error.message);
      // No lanzar error para evitar loops infinitos
      return null;
    }
  }

  /**
   * Obtener todos los logs con filtros
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        l.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.nivel) {
      sql += ' AND l.nivel = ?';
      params.push(filters.nivel);
    }

    if (filters.origen) {
      sql += ' AND l.origen LIKE ?';
      params.push(`%${filters.origen}%`);
    }

    if (filters.fecha_inicio) {
      sql += ' AND l.fecha >= ?';
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      sql += ' AND l.fecha <= ?';
      params.push(filters.fecha_fin);
    }

    if (filters.usuario_id) {
      sql += ' AND l.usuario_id = ?';
      params.push(filters.usuario_id);
    }

    // Límite de resultados
    const limit = filters.limit || 100;
    sql += ` ORDER BY l.fecha DESC LIMIT ${limit}`;

    try {
      const logs = await db.all(sql, params);
      return logs;
    } catch (error) {
      console.error('❌ Error al obtener logs:', error.message);
      throw error;
    }
  }

  /**
   * Obtener un log por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        l.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE l.id = ?
    `;

    try {
      const log = await db.get(sql, [id]);
      return log;
    } catch (error) {
      console.error('❌ Error al obtener log:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de logs
   */
  static async getEstadisticas(periodo = '24h') {
    let fecha_desde;
    const ahora = new Date();

    switch (periodo) {
      case '1h':
        fecha_desde = new Date(ahora.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        fecha_desde = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fecha_desde = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fecha_desde = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        fecha_desde = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    }

    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN nivel = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN nivel = 'warn' THEN 1 ELSE 0 END) as warn,
        SUM(CASE WHEN nivel = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN nivel = 'debug' THEN 1 ELSE 0 END) as debug,
        SUM(CASE WHEN nivel = 'critical' THEN 1 ELSE 0 END) as critical,
        origen,
        COUNT(*) as count
      FROM logs_sistema
      WHERE fecha >= ?
      GROUP BY origen
      ORDER BY count DESC
    `;

    const sqlTotales = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN nivel = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN nivel = 'warn' THEN 1 ELSE 0 END) as warn,
        SUM(CASE WHEN nivel = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN nivel = 'debug' THEN 1 ELSE 0 END) as debug,
        SUM(CASE WHEN nivel = 'critical' THEN 1 ELSE 0 END) as critical
      FROM logs_sistema
      WHERE fecha >= ?
    `;

    try {
      const porOrigen = await db.all(sql, [fecha_desde.toISOString()]);
      const totales = await db.get(sqlTotales, [fecha_desde.toISOString()]);

      return {
        periodo,
        fecha_desde: fecha_desde.toISOString(),
        totales,
        por_origen: porOrigen
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de logs:', error.message);
      throw error;
    }
  }

  /**
   * Obtener logs recientes (últimos N)
   */
  static async getRecientes(limit = 50) {
    const sql = `
      SELECT 
        l.*,
        u.nombre as usuario_nombre
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      ORDER BY l.fecha DESC
      LIMIT ?
    `;

    try {
      const logs = await db.all(sql, [limit]);
      return logs;
    } catch (error) {
      console.error('❌ Error al obtener logs recientes:', error.message);
      throw error;
    }
  }

  /**
   * Limpiar logs antiguos (mantenimiento)
   */
  static async limpiarAntiguos(dias = 90) {
    const fecha_limite = new Date();
    fecha_limite.setDate(fecha_limite.getDate() - dias);

    const sql = `DELETE FROM logs_sistema WHERE fecha < ?`;

    try {
      const result = await db.run(sql, [fecha_limite.toISOString()]);
      
      await this.create({
        nivel: 'info',
        origen: 'sistema',
        mensaje: `Logs antiguos limpiados (${result.changes} registros eliminados)`,
        meta: JSON.stringify({ dias, registros_eliminados: result.changes })
      });

      return { registros_eliminados: result.changes };
    } catch (error) {
      console.error('❌ Error al limpiar logs antiguos:', error.message);
      throw error;
    }
  }

  /**
   * Registrar evento de inicio de sesión
   */
  static async logLogin(usuario_id, ip_address = null, exitoso = true) {
    return await this.create({
      nivel: exitoso ? 'info' : 'warn',
      origen: 'autenticacion',
      mensaje: exitoso ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido',
      usuario_id: exitoso ? usuario_id : null,
      ip_address,
      meta: JSON.stringify({ usuario_id, exitoso })
    });
  }

  /**
   * Registrar evento de cierre de sesión
   */
  static async logLogout(usuario_id, ip_address = null) {
    return await this.create({
      nivel: 'info',
      origen: 'autenticacion',
      mensaje: 'Cierre de sesión',
      usuario_id,
      ip_address,
      meta: JSON.stringify({ usuario_id })
    });
  }

  /**
   * Registrar error del sistema
   */
  static async logError(origen, mensaje, error_details = null, usuario_id = null) {
    return await this.create({
      nivel: 'error',
      origen,
      mensaje,
      usuario_id,
      meta: JSON.stringify({ 
        error: error_details?.message || error_details,
        stack: error_details?.stack
      })
    });
  }
}

module.exports = LogModel;
