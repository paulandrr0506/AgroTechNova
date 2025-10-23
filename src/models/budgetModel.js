const db = require('../db/database');

class BudgetModel {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER NOT NULL UNIQUE,
        monto_total DECIMAL(12,2) NOT NULL CHECK(monto_total >= 0),
        monto_gastado DECIMAL(12,2) DEFAULT 0 CHECK(monto_gastado >= 0),
        monto_disponible DECIMAL(12,2) GENERATED ALWAYS AS (monto_total - monto_gastado) VIRTUAL,
        descripcion TEXT,
        fecha_creacion DATE DEFAULT (date('now')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    const { proyecto_id, monto_total, descripcion } = data;
    
    const sql = `
      INSERT INTO presupuestos (proyecto_id, monto_total, descripcion)
      VALUES (?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [proyecto_id, monto_total, descripcion || null],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, proyecto_id, monto_total, monto_gastado: 0, descripcion });
        }
      );
    });
  }

  static async findAll() {
    const sql = `
      SELECT p.*, pr.nombre as proyecto_nombre
      FROM presupuestos p
      LEFT JOIN proyectos pr ON p.proyecto_id = pr.id
      ORDER BY p.created_at DESC
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
      SELECT p.*, pr.nombre as proyecto_nombre
      FROM presupuestos p
      LEFT JOIN proyectos pr ON p.proyecto_id = pr.id
      WHERE p.id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByProject(proyecto_id) {
    const sql = `
      SELECT * FROM presupuestos WHERE proyecto_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [proyecto_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.monto_total !== undefined) {
      fields.push('monto_total = ?');
      values.push(data.monto_total);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 1) {
      return Promise.reject(new Error('No hay campos para actualizar'));
    }

    values.push(id);
    const sql = `UPDATE presupuestos SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, values, function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Presupuesto no encontrado'));
        else resolve({ id, ...data });
      });
    });
  }

  static async updateSpent(proyecto_id, monto) {
    const sql = `
      UPDATE presupuestos 
      SET monto_gastado = monto_gastado + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE proyecto_id = ?
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [monto, proyecto_id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Presupuesto no encontrado'));
        else resolve({ updated: true });
      });
    });
  }

  static async delete(id) {
    const sql = 'DELETE FROM presupuestos WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Presupuesto no encontrado'));
        else resolve({ deleted: true });
      });
    });
  }

  static async getStatus(proyecto_id) {
    const sql = `
      SELECT 
        monto_total,
        monto_gastado,
        (monto_total - monto_gastado) as monto_disponible,
        ROUND((monto_gastado * 100.0 / monto_total), 2) as porcentaje_gastado
      FROM presupuestos
      WHERE proyecto_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [proyecto_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async checkAvailability(proyecto_id, monto_requerido) {
    const sql = `
      SELECT 
        (monto_total - monto_gastado) >= ? as tiene_disponible,
        (monto_total - monto_gastado) as monto_disponible
      FROM presupuestos
      WHERE proyecto_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [monto_requerido, proyecto_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = BudgetModel;
