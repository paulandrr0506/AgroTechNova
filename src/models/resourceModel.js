const db = require('../db/database');

class ResourceModel {
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS recursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL CHECK(tipo IN ('material', 'equipo', 'insumo', 'mano_obra', 'otro')),
        cantidad DECIMAL(10,2) NOT NULL CHECK(cantidad >= 0),
        unidad VARCHAR(20) NOT NULL,
        costo_unitario DECIMAL(10,2) NOT NULL CHECK(costo_unitario >= 0),
        proyecto_id INTEGER NOT NULL,
        fase_id INTEGER,
        descripcion TEXT,
        fecha_asignacion DATE DEFAULT (date('now')),
        estado VARCHAR(20) DEFAULT 'disponible' CHECK(estado IN ('disponible', 'en_uso', 'agotado')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
        FOREIGN KEY (fase_id) REFERENCES fases(id) ON DELETE SET NULL
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
    const { nombre, tipo, cantidad, unidad, costo_unitario, proyecto_id, fase_id, descripcion, estado } = data;
    
    const sql = `
      INSERT INTO recursos (nombre, tipo, cantidad, unidad, costo_unitario, proyecto_id, fase_id, descripcion, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [nombre, tipo, cantidad, unidad, costo_unitario, proyecto_id, fase_id || null, descripcion || null, estado || 'disponible'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...data });
        }
      );
    });
  }

  static async findAll() {
    const sql = 'SELECT * FROM recursos ORDER BY created_at DESC';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    const sql = 'SELECT * FROM recursos WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findByProject(proyecto_id) {
    const sql = `
      SELECT r.*, 
             (r.cantidad * r.costo_unitario) as costo_total
      FROM recursos r
      WHERE r.proyecto_id = ?
      ORDER BY r.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findByPhase(fase_id) {
    const sql = `
      SELECT r.*,
             (r.cantidad * r.costo_unitario) as costo_total
      FROM recursos r
      WHERE r.fase_id = ?
      ORDER BY r.created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [fase_id], (err, rows) => {
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
    if (data.tipo !== undefined) {
      fields.push('tipo = ?');
      values.push(data.tipo);
    }
    if (data.cantidad !== undefined) {
      fields.push('cantidad = ?');
      values.push(data.cantidad);
    }
    if (data.unidad !== undefined) {
      fields.push('unidad = ?');
      values.push(data.unidad);
    }
    if (data.costo_unitario !== undefined) {
      fields.push('costo_unitario = ?');
      values.push(data.costo_unitario);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      values.push(data.estado);
    }
    if (data.fase_id !== undefined) {
      fields.push('fase_id = ?');
      values.push(data.fase_id);
    }

    if (fields.length === 0) {
      return Promise.reject(new Error('No hay campos para actualizar'));
    }

    values.push(id);
    const sql = `UPDATE recursos SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, values, function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Recurso no encontrado'));
        else resolve({ id, ...data });
      });
    });
  }

  static async delete(id) {
    const sql = 'DELETE FROM recursos WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Recurso no encontrado'));
        else resolve({ deleted: true });
      });
    });
  }

  static async getTotalCostByProject(proyecto_id) {
    const sql = `
      SELECT 
        SUM(cantidad * costo_unitario) as total_costo,
        COUNT(*) as total_recursos
      FROM recursos
      WHERE proyecto_id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().get(sql, [proyecto_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getStatsByType(proyecto_id) {
    const sql = `
      SELECT 
        tipo,
        COUNT(*) as cantidad_items,
        SUM(cantidad * costo_unitario) as costo_total
      FROM recursos
      WHERE proyecto_id = ?
      GROUP BY tipo
      ORDER BY costo_total DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getPersonalDisponible(proyecto_id) {
    const sql = `
      SELECT *
      FROM recursos
      WHERE proyecto_id = ?
        AND tipo = 'mano_obra'
        AND estado IN ('disponible', 'en_uso')
      ORDER BY nombre ASC
    `;
    
    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [proyecto_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = ResourceModel;
