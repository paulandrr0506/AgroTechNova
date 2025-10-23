/**
 * MODELO DE PROYECTOS - AGROTECHNOVA
 * 
 * Gestiona proyectos agroindustriales (RF41).
 * 
 * Cumple con:
 * - RF41: Registro de proyectos
 * - RF15: Edición de proyectos
 * - RF62: Búsqueda de proyectos
 * - RF23: Categorización por sector
 */

const db = require('../db/database');

class ProjectModel {
  /**
   * Crea la tabla de proyectos
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS proyectos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(200) NOT NULL UNIQUE,
        descripcion TEXT,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'planificacion',
        categoria_id INTEGER NOT NULL,
        responsable_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias_proyecto(id),
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
        CHECK (estado IN ('planificacion', 'ejecucion', 'finalizado', 'cancelado', 'suspendido')),
        CHECK (fecha_fin >= fecha_inicio)
      )
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Tabla "proyectos" creada correctamente');
          resolve();
        }
      });
    });
  }

  /**
   * Crea un nuevo proyecto (RF41)
   */
  static async create(projectData) {
    const { nombre, descripcion, fecha_inicio, fecha_fin, categoria_id, responsable_id, estado = 'planificacion' } = projectData;

    const sql = `
      INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado, categoria_id, responsable_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(
        sql,
        [nombre, descripcion, fecha_inicio, fecha_fin, estado, categoria_id, responsable_id],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              reject(new Error('Ya existe un proyecto con ese nombre'));
            } else {
              reject(err);
            }
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Busca todos los proyectos
   */
  static async findAll() {
    const sql = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        u.nombre as responsable_nombre,
        u.email as responsable_email
      FROM proyectos p
      LEFT JOIN categorias_proyecto c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.responsable_id = u.id
      ORDER BY p.created_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca un proyecto por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        u.nombre as responsable_nombre,
        u.email as responsable_email
      FROM proyectos p
      LEFT JOIN categorias_proyecto c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.responsable_id = u.id
      WHERE p.id = ?
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
   * Búsqueda de proyectos por filtros (RF62)
   * @param {Object} filters - { nombre, estado, fecha_inicio, fecha_fin }
   */
  static async search(filters) {
    let sql = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre,
        u.nombre as responsable_nombre
      FROM proyectos p
      LEFT JOIN categorias_proyecto c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.responsable_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.nombre) {
      sql += ` AND p.nombre LIKE ?`;
      params.push(`%${filters.nombre}%`);
    }

    if (filters.estado) {
      sql += ` AND p.estado = ?`;
      params.push(filters.estado);
    }

    if (filters.fecha_inicio) {
      sql += ` AND p.fecha_inicio >= ?`;
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      sql += ` AND p.fecha_fin <= ?`;
      params.push(filters.fecha_fin);
    }

    if (filters.categoria_id) {
      sql += ` AND p.categoria_id = ?`;
      params.push(filters.categoria_id);
    }

    sql += ` ORDER BY p.created_at DESC`;

    return new Promise((resolve, reject) => {
      db.getDatabase().all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Actualiza un proyecto (RF15)
   * Solo permite editar proyectos en estado "planificacion" o "ejecucion"
   */
  static async update(id, projectData) {
    // Verificar estado actual
    const project = await this.findById(id);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    // RF15: Restricción de edición
    if (!['planificacion', 'ejecucion'].includes(project.estado)) {
      throw new Error(`No se puede editar un proyecto en estado "${project.estado}"`);
    }

    const fields = [];
    const params = [];

    if (projectData.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(projectData.nombre);
    }

    if (projectData.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(projectData.descripcion);
    }

    if (projectData.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = ?');
      params.push(projectData.fecha_inicio);
    }

    if (projectData.fecha_fin !== undefined) {
      fields.push('fecha_fin = ?');
      params.push(projectData.fecha_fin);
    }

    if (projectData.estado !== undefined) {
      fields.push('estado = ?');
      params.push(projectData.estado);
    }

    if (projectData.categoria_id !== undefined) {
      fields.push('categoria_id = ?');
      params.push(projectData.categoria_id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE proyectos SET ${fields.join(', ')} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, params, function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            reject(new Error('Ya existe un proyecto con ese nombre'));
          } else {
            reject(err);
          }
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Elimina un proyecto
   * Solo se pueden eliminar proyectos en estado "planificacion"
   */
  static async delete(id) {
    const project = await this.findById(id);

    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    if (project.estado !== 'planificacion') {
      throw new Error('Solo se pueden eliminar proyectos en estado de planificación');
    }

    const sql = `DELETE FROM proyectos WHERE id = ?`;

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
   * Obtiene proyectos por responsable
   */
  static async findByResponsible(userId) {
    const sql = `
      SELECT 
        p.*,
        c.nombre as categoria_nombre
      FROM proyectos p
      LEFT JOIN categorias_proyecto c ON p.categoria_id = c.id
      WHERE p.responsable_id = ?
      ORDER BY p.created_at DESC
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
}

module.exports = ProjectModel;
