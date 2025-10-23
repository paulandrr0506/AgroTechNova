/**
 * MODELO DE FASES DE PROYECTO - AGROTECHNOVA
 * 
 * Gestiona las fases de cada proyecto (RF13).
 * 
 * Cumple con:
 * - RF13: Seguimiento por fases del proyecto
 */

const db = require('../db/database');

class PhaseModel {
  /**
   * Crea la tabla de fases
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS fases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        porcentaje_avance INTEGER DEFAULT 0,
        proyecto_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
        CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
        CHECK (fecha_fin >= fecha_inicio)
      )
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Tabla "fases" creada correctamente');
          resolve();
        }
      });
    });
  }

  /**
   * Crea una nueva fase (RF13)
   */
  static async create(phaseData) {
    const { nombre, descripcion, fecha_inicio, fecha_fin, proyecto_id, porcentaje_avance = 0 } = phaseData;

    const sql = `
      INSERT INTO fases (nombre, descripcion, fecha_inicio, fecha_fin, porcentaje_avance, proyecto_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [nombre, descripcion, fecha_inicio, fecha_fin, porcentaje_avance, proyecto_id],
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
   * Busca todas las fases de un proyecto
   */
  static async findByProject(projectId) {
    const sql = `
      SELECT * FROM fases 
      WHERE proyecto_id = ?
      ORDER BY fecha_inicio ASC
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
   * Busca una fase por ID
   */
  static async findById(id) {
    const sql = `
      SELECT f.*, p.nombre as proyecto_nombre
      FROM fases f
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      WHERE f.id = ?
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
   * Actualiza una fase
   */
  static async update(id, phaseData) {
    const fields = [];
    const params = [];

    if (phaseData.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(phaseData.nombre);
    }

    if (phaseData.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(phaseData.descripcion);
    }

    if (phaseData.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = ?');
      params.push(phaseData.fecha_inicio);
    }

    if (phaseData.fecha_fin !== undefined) {
      fields.push('fecha_fin = ?');
      params.push(phaseData.fecha_fin);
    }

    if (phaseData.porcentaje_avance !== undefined) {
      fields.push('porcentaje_avance = ?');
      params.push(phaseData.porcentaje_avance);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE fases SET ${fields.join(', ')} WHERE id = ?`;

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
   * Elimina una fase
   */
  static async delete(id) {
    const sql = `DELETE FROM fases WHERE id = ?`;

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
   * Obtiene el avance promedio de fases de un proyecto
   */
  static async getProjectProgress(projectId) {
    const sql = `
      SELECT AVG(porcentaje_avance) as avance_promedio
      FROM fases
      WHERE proyecto_id = ?
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [projectId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.avance_promedio || 0);
        }
      });
    });
  }
}

module.exports = PhaseModel;
