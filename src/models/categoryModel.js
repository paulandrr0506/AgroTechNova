/**
 * MODELO DE CATEGORÍAS DE PROYECTO - AGROTECHNOVA
 * 
 * Gestiona las categorías para clasificar proyectos por sector productivo (RF23).
 * 
 * Categorías:
 * - Agrícola
 * - Pecuario
 * - Agroindustrial
 * - Mixto
 */

const db = require('../db/database');

class CategoryModel {
  /**
   * Crea la tabla de categorías de proyecto
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS categorias_proyecto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      db.getDatabase().run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Tabla "categorias_proyecto" creada correctamente');
          resolve();
        }
      });
    });
  }

  /**
   * Inserta categorías por defecto (RF23)
   */
  static async seedDefaultCategories() {
    const categories = [
      { nombre: 'Agrícola', descripcion: 'Proyectos relacionados con cultivos y producción vegetal' },
      { nombre: 'Pecuario', descripcion: 'Proyectos relacionados con ganadería y producción animal' },
      { nombre: 'Agroindustrial', descripcion: 'Proyectos de transformación y procesamiento de productos agropecuarios' },
      { nombre: 'Mixto', descripcion: 'Proyectos que combinan múltiples sectores productivos' }
    ];

    const sql = `INSERT OR IGNORE INTO categorias_proyecto (nombre, descripcion) VALUES (?, ?)`;

    for (const category of categories) {
      await new Promise((resolve, reject) => {
        db.getDatabase().run(sql, [category.nombre, category.descripcion], (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Categoría "${category.nombre}" insertada`);
            resolve();
          }
        });
      });
    }
  }

  /**
   * Obtiene todas las categorías
   */
  static async findAll() {
    const sql = `SELECT * FROM categorias_proyecto ORDER BY nombre`;

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
   * Busca una categoría por ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM categorias_proyecto WHERE id = ?`;

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
}

module.exports = CategoryModel;
