const db = require('../db/database');

class ExpenseModel {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER NOT NULL,
        recurso_id INTEGER,
        descripcion TEXT NOT NULL,
        monto DECIMAL(10,2) NOT NULL CHECK(monto > 0),
        fecha DATE NOT NULL,
        categoria VARCHAR(50) DEFAULT 'general' CHECK(categoria IN ('recurso', 'servicio', 'transporte', 'personal', 'general')),
        comprobante VARCHAR(200),
        estado VARCHAR(20) DEFAULT 'registrado' CHECK(estado IN ('registrado', 'aprobado', 'rechazado')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
        FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE SET NULL
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
    const { proyecto_id, recurso_id, descripcion, monto, fecha, categoria, comprobante, estado } = data;
    
    const sql = `
      INSERT INTO gastos (proyecto_id, recurso_id, descripcion, monto, fecha, categoria, comprobante, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [
          proyecto_id,
          recurso_id || null,
          descripcion,
          monto,
          fecha,
          categoria || 'general',
          comprobante || null,
          estado || 'registrado'
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...data });
        }
      );
    });
  }

  static async findAll() {
    const sql = `
      SELECT g.*, 
             p.nombre as proyecto_nombre,
             r.nombre as recurso_nombre
      FROM gastos g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      LEFT JOIN recursos r ON g.recurso_id = r.id
      ORDER BY g.fecha DESC, g.created_at DESC
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
      SELECT g.*,
             p.nombre as proyecto_nombre,
             r.nombre as recurso_nombre
      FROM gastos g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      LEFT JOIN recursos r ON g.recurso_id = r.id
      WHERE g.id = ?
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
      SELECT g.*,
             r.nombre as recurso_nombre
      FROM gastos g
      LEFT JOIN recursos r ON g.recurso_id = r.id
      WHERE g.proyecto_id = ?
      ORDER BY g.fecha DESC, g.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByResource(recurso_id) {
    const sql = `
      SELECT g.*,
             p.nombre as proyecto_nombre
      FROM gastos g
      LEFT JOIN proyectos p ON g.proyecto_id = p.id
      WHERE g.recurso_id = ?
      ORDER BY g.fecha DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [recurso_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.monto !== undefined) {
      fields.push('monto = ?');
      values.push(data.monto);
    }
    if (data.fecha !== undefined) {
      fields.push('fecha = ?');
      values.push(data.fecha);
    }
    if (data.categoria !== undefined) {
      fields.push('categoria = ?');
      values.push(data.categoria);
    }
    if (data.comprobante !== undefined) {
      fields.push('comprobante = ?');
      values.push(data.comprobante);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      values.push(data.estado);
    }

    if (fields.length === 0) {
      return Promise.reject(new Error('No hay campos para actualizar'));
    }

    values.push(id);
    const sql = `UPDATE gastos SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, values, function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Gasto no encontrado'));
        else resolve({ id, ...data });
      });
    });
  }

  static async delete(id) {
    const sql = 'DELETE FROM gastos WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Gasto no encontrado'));
        else resolve({ deleted: true });
      });
    });
  }

  static async getTotalByProject(proyecto_id) {
    const sql = `
      SELECT 
        SUM(monto) as total_gastado,
        COUNT(*) as total_gastos
      FROM gastos
      WHERE proyecto_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [proyecto_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getByCategory(proyecto_id) {
    const sql = `
      SELECT 
        categoria,
        COUNT(*) as cantidad_gastos,
        SUM(monto) as total_monto
      FROM gastos
      WHERE proyecto_id = ?
      GROUP BY categoria
      ORDER BY total_monto DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getByDateRange(proyecto_id, fecha_inicio, fecha_fin) {
    const sql = `
      SELECT g.*,
             r.nombre as recurso_nombre
      FROM gastos g
      LEFT JOIN recursos r ON g.recurso_id = r.id
      WHERE g.proyecto_id = ?
        AND g.fecha BETWEEN ? AND ?
      ORDER BY g.fecha DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id, fecha_inicio, fecha_fin], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = ExpenseModel;
