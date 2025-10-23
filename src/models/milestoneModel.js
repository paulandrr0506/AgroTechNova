/**
 * MODELO DE HITOS - AGROTECHNOVA
 * 
 * Gestiona hitos importantes dentro de las fases de proyecto (RF25).
 * 
 * Cumple con:
 * - RF25: Seguimiento de hitos del proyecto
 */

const db = require('../db/database');

class MilestoneModel {
  /**
   * Crea la tabla de hitos
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS hitos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        fecha_limite DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        responsable_id INTEGER,
        fase_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_completado DATETIME,
        FOREIGN KEY (fase_id) REFERENCES fases(id) ON DELETE CASCADE,
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
        CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'retrasado'))
      )
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Tabla "hitos" creada correctamente');
          resolve();
        }
      });
    });
  }

  /**
   * Crea un nuevo hito (RF25)
   */
  static async create(milestoneData) {
    const { nombre, descripcion, fecha_limite, fase_id, responsable_id, estado = 'pendiente' } = milestoneData;

    const sql = `
      INSERT INTO hitos (nombre, descripcion, fecha_limite, estado, responsable_id, fase_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [nombre, descripcion, fecha_limite, estado, responsable_id, fase_id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Busca todos los hitos de una fase
   */
  static async findByPhase(phaseId) {
    const sql = `
      SELECT 
        h.*,
        u.nombre as responsable_nombre,
        f.nombre as fase_nombre
      FROM hitos h
      LEFT JOIN usuarios u ON h.responsable_id = u.id
      LEFT JOIN fases f ON h.fase_id = f.id
      WHERE h.fase_id = ?
      ORDER BY h.fecha_limite ASC
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [phaseId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca todos los hitos de un proyecto (a través de sus fases)
   */
  static async findByProject(projectId) {
    const sql = `
      SELECT 
        h.*,
        u.nombre as responsable_nombre,
        f.nombre as fase_nombre,
        p.nombre as proyecto_nombre
      FROM hitos h
      LEFT JOIN usuarios u ON h.responsable_id = u.id
      LEFT JOIN fases f ON h.fase_id = f.id
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      WHERE f.proyecto_id = ?
      ORDER BY h.fecha_limite ASC
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [projectId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca un hito por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        h.*,
        u.nombre as responsable_nombre,
        u.email as responsable_email,
        f.nombre as fase_nombre
      FROM hitos h
      LEFT JOIN usuarios u ON h.responsable_id = u.id
      LEFT JOIN fases f ON h.fase_id = f.id
      WHERE h.id = ?
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Actualiza un hito
   */
  static async update(id, milestoneData) {
    const fields = [];
    const params = [];

    if (milestoneData.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(milestoneData.nombre);
    }

    if (milestoneData.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(milestoneData.descripcion);
    }

    if (milestoneData.fecha_limite !== undefined) {
      fields.push('fecha_limite = ?');
      params.push(milestoneData.fecha_limite);
    }

    if (milestoneData.estado !== undefined) {
      fields.push('estado = ?');
      params.push(milestoneData.estado);

      // Si se completa el hito, registrar fecha
      if (milestoneData.estado === 'completado') {
        fields.push('fecha_completado = CURRENT_TIMESTAMP');
      }
    }

    if (milestoneData.responsable_id !== undefined) {
      fields.push('responsable_id = ?');
      params.push(milestoneData.responsable_id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE hitos SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Elimina un hito
   */
  static async delete(id) {
    const sql = `DELETE FROM hitos WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Obtiene hitos por responsable
   */
  static async findByResponsible(userId) {
    const sql = `
      SELECT 
        h.*,
        f.nombre as fase_nombre,
        p.nombre as proyecto_nombre
      FROM hitos h
      LEFT JOIN fases f ON h.fase_id = f.id
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      WHERE h.responsable_id = ?
      ORDER BY h.fecha_limite ASC
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Obtiene estadísticas de hitos de un proyecto
   */
  static async getProjectStats(projectId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'retrasado' THEN 1 ELSE 0 END) as retrasados
      FROM hitos h
      LEFT JOIN fases f ON h.fase_id = f.id
      WHERE f.proyecto_id = ?
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [projectId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = MilestoneModel;
