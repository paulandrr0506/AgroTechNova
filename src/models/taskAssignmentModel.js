const db = require('../db/database');

class TaskAssignmentModel {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS asignaciones_tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarea_id INTEGER NOT NULL,
        recurso_id INTEGER NOT NULL,
        fecha_asignacion DATE DEFAULT (date('now')),
        horas_estimadas DECIMAL(10,2),
        horas_trabajadas DECIMAL(10,2) DEFAULT 0,
        notas TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
        FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE CASCADE,
        UNIQUE(tarea_id, recurso_id)
      )
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static async create(data) {
    const { tarea_id, recurso_id, fecha_asignacion, horas_estimadas, notas } = data;
    
    const sql = `
      INSERT INTO asignaciones_tareas (tarea_id, recurso_id, fecha_asignacion, horas_estimadas, notas)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [tarea_id, recurso_id, fecha_asignacion || new Date().toISOString().split('T')[0], horas_estimadas, notas], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      });
    });
  }

  static async findByTask(tarea_id) {
    const sql = `
      SELECT a.*, r.nombre as recurso_nombre, r.tipo as recurso_tipo
      FROM asignaciones_tareas a
      LEFT JOIN recursos r ON a.recurso_id = r.id
      WHERE a.tarea_id = ?
      ORDER BY a.fecha_asignacion DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [tarea_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByResource(recurso_id) {
    const sql = `
      SELECT a.*, t.nombre as tarea_nombre, t.estado as tarea_estado, t.fecha_inicio, t.fecha_fin
      FROM asignaciones_tareas a
      LEFT JOIN tareas t ON a.tarea_id = t.id
      WHERE a.recurso_id = ?
      ORDER BY t.fecha_inicio DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [recurso_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async checkAvailability(recurso_id, fecha_inicio, fecha_fin) {
    const sql = `
      SELECT COUNT(*) as count
      FROM asignaciones_tareas a
      JOIN tareas t ON a.tarea_id = t.id
      WHERE a.recurso_id = ?
        AND t.estado IN ('pendiente', 'en_progreso')
        AND (
          (t.fecha_inicio <= ? AND t.fecha_fin >= ?)
          OR (t.fecha_inicio <= ? AND t.fecha_fin >= ?)
          OR (t.fecha_inicio >= ? AND t.fecha_fin <= ?)
        )
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [recurso_id, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio, fecha_inicio, fecha_fin], (err, row) => {
        if (err) reject(err);
        else resolve({ disponible: row.count === 0, conflictos: row.count });
      });
    });
  }

  static async updateHours(id, horas_trabajadas) {
    const sql = 'UPDATE asignaciones_tareas SET horas_trabajadas = ? WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [horas_trabajadas, id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Asignación no encontrada'));
        else resolve({ updated: true });
      });
    });
  }

  static async delete(id) {
    const sql = 'DELETE FROM asignaciones_tareas WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Asignación no encontrada'));
        else resolve({ deleted: true });
      });
    });
  }
}

module.exports = TaskAssignmentModel;
