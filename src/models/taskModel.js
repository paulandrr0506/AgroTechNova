const db = require('../db/database');

class TaskModel {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fase_id INTEGER NOT NULL,
        proyecto_id INTEGER NOT NULL,
        fecha_inicio DATE,
        fecha_fin DATE,
        estado VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
        prioridad VARCHAR(20) DEFAULT 'media' CHECK(prioridad IN ('baja', 'media', 'alta', 'urgente')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fase_id) REFERENCES fases(id) ON DELETE CASCADE,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
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
    const { nombre, descripcion, fase_id, proyecto_id, fecha_inicio, fecha_fin, estado, prioridad } = data;
    
    const sql = `
      INSERT INTO tareas (nombre, descripcion, fase_id, proyecto_id, fecha_inicio, fecha_fin, estado, prioridad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [nombre, descripcion, fase_id, proyecto_id, fecha_inicio, fecha_fin, estado || 'pendiente', prioridad || 'media'], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      });
    });
  }

  static async findAll() {
    const sql = `
      SELECT t.*, f.nombre as fase_nombre, p.nombre as proyecto_nombre
      FROM tareas t
      LEFT JOIN fases f ON t.fase_id = f.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      ORDER BY t.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, f.nombre as fase_nombre, p.nombre as proyecto_nombre
      FROM tareas t
      LEFT JOIN fases f ON t.fase_id = f.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByPhase(fase_id) {
    const sql = 'SELECT * FROM tareas WHERE fase_id = ? ORDER BY prioridad DESC, fecha_inicio ASC';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [fase_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByProject(proyecto_id) {
    const sql = `
      SELECT t.*, f.nombre as fase_nombre
      FROM tareas t
      LEFT JOIN fases f ON t.fase_id = f.id
      WHERE t.proyecto_id = ?
      ORDER BY t.fecha_inicio ASC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = ?');
      values.push(data.fecha_inicio);
    }
    if (data.fecha_fin !== undefined) {
      fields.push('fecha_fin = ?');
      values.push(data.fecha_fin);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      values.push(data.estado);
    }
    if (data.prioridad !== undefined) {
      fields.push('prioridad = ?');
      values.push(data.prioridad);
    }

    if (fields.length === 0) {
      return Promise.reject(new Error('No hay campos para actualizar'));
    }

    values.push(id);
    const sql = `UPDATE tareas SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, values, function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Tarea no encontrada'));
        else resolve({ id, ...data });
      });
    });
  }

  static async delete(id) {
    const sql = 'DELETE FROM tareas WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Tarea no encontrada'));
        else resolve({ deleted: true });
      });
    });
  }
}

module.exports = TaskModel;
