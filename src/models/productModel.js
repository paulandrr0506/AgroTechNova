/**
 * MODELO: Productos (Sprint 4 - RF06, RF43, RF45)
 * Gestión de productos del inventario
 */

const db = require('../db/database');

class ProductModel {
  /**
   * Crear tabla de productos
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        tipo TEXT NOT NULL,
        categoria TEXT,
        unidad TEXT NOT NULL,
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 0,
        costo_unitario REAL NOT NULL,
        proveedor_id INTEGER,
        estado TEXT DEFAULT 'disponible',
        es_organico INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
      )
    `;

    try {
      await db.run(query);
      console.log('✅ Tabla "productos" creada correctamente');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Tabla "productos" ya existe');
      } else {
        console.error('❌ Error creando tabla productos:', error);
        throw error;
      }
    }
  }

  /**
   * Crear un nuevo producto (RF06, RF43)
   */
  static async create({ nombre, descripcion, tipo, categoria, unidad, stock_actual, stock_minimo, costo_unitario, proveedor_id, es_organico }) {
    const query = `
      INSERT INTO productos (nombre, descripcion, tipo, categoria, unidad, stock_actual, stock_minimo, costo_unitario, proveedor_id, es_organico)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      nombre, 
      descripcion, 
      tipo, 
      categoria, 
      unidad, 
      stock_actual || 0, 
      stock_minimo || 0, 
      costo_unitario, 
      proveedor_id, 
      es_organico || 0
    ]);
    return result.lastID;
  }

  /**
   * Obtener todos los productos
   */
  static async findAll() {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      ORDER BY p.nombre ASC
    `;
    return await db.all(query);
  }

  /**
   * Obtener productos disponibles
   */
  static async findAvailable() {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.estado = 'disponible'
      ORDER BY p.nombre ASC
    `;
    return await db.all(query);
  }

  /**
   * Buscar producto por ID
   */
  static async findById(id) {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?
    `;
    return await db.get(query, [id]);
  }

  /**
   * Buscar productos por tipo (RF45 - orgánico/químico)
   */
  static async findByTipo(tipo) {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.tipo = ?
      ORDER BY p.nombre ASC
    `;
    return await db.all(query, [tipo]);
  }

  /**
   * Buscar productos orgánicos (RF45)
   */
  static async findOrganicos() {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.es_organico = 1
      ORDER BY p.nombre ASC
    `;
    return await db.all(query);
  }

  /**
   * Buscar productos con stock bajo
   */
  static async findLowStock() {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.stock_actual <= p.stock_minimo
      ORDER BY p.stock_actual ASC
    `;
    return await db.all(query);
  }

  /**
   * Buscar productos por proveedor (RF18)
   */
  static async findByProveedor(proveedor_id) {
    const query = `
      SELECT p.*, pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.proveedor_id = ?
      ORDER BY p.nombre ASC
    `;
    return await db.all(query, [proveedor_id]);
  }

  /**
   * Actualizar producto (RF43)
   */
  static async update(id, { nombre, descripcion, tipo, categoria, unidad, stock_minimo, costo_unitario, proveedor_id, estado, es_organico }) {
    const query = `
      UPDATE productos 
      SET nombre = ?, descripcion = ?, tipo = ?, categoria = ?, unidad = ?, 
          stock_minimo = ?, costo_unitario = ?, proveedor_id = ?, estado = ?, 
          es_organico = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await db.run(query, [
      nombre, 
      descripcion, 
      tipo, 
      categoria, 
      unidad, 
      stock_minimo, 
      costo_unitario, 
      proveedor_id, 
      estado, 
      es_organico,
      id
    ]);
    return result.changes > 0;
  }

  /**
   * Actualizar stock del producto
   */
  static async updateStock(id, cantidad) {
    const query = 'UPDATE productos SET stock_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await db.run(query, [cantidad, id]);
    return result.changes > 0;
  }

  /**
   * Incrementar stock (entrada)
   */
  static async incrementStock(id, cantidad) {
    const query = 'UPDATE productos SET stock_actual = stock_actual + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await db.run(query, [cantidad, id]);
    return result.changes > 0;
  }

  /**
   * Decrementar stock (salida)
   */
  static async decrementStock(id, cantidad) {
    const query = 'UPDATE productos SET stock_actual = stock_actual - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await db.run(query, [cantidad, id]);
    return result.changes > 0;
  }

  /**
   * Eliminar producto
   */
  static async delete(id) {
    const query = 'DELETE FROM productos WHERE id = ?';
    const result = await db.run(query, [id]);
    return result.changes > 0;
  }

  /**
   * Obtener valor total del inventario
   */
  static async getTotalValue() {
    const query = 'SELECT SUM(stock_actual * costo_unitario) as total FROM productos';
    const result = await db.get(query);
    return result.total || 0;
  }
}

module.exports = ProductModel;
