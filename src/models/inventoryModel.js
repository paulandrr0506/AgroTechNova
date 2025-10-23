/**
 * MODELO: Movimientos de Inventario (Sprint 4 - RF08, RF09, RF43)
 * Registro de entradas y salidas de productos
 */

const db = require('../db/database');

class InventoryModel {
  /**
   * Crear tabla de movimientos de inventario
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        costo_unitario REAL,
        costo_total REAL,
        proyecto_id INTEGER,
        usuario_id INTEGER,
        descripcion TEXT,
        fecha DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `;

    try {
      await db.run(query);
      console.log('✅ Tabla "movimientos_inventario" creada correctamente');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Tabla "movimientos_inventario" ya existe');
      } else {
        console.error('❌ Error creando tabla movimientos_inventario:', error);
        throw error;
      }
    }
  }

  /**
   * Registrar entrada de producto (RF43)
   */
  static async registrarEntrada({ producto_id, cantidad, costo_unitario, descripcion, usuario_id, fecha }) {
    const costo_total = cantidad * costo_unitario;
    
    const query = `
      INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, costo_unitario, costo_total, descripcion, usuario_id, fecha)
      VALUES (?, 'entrada', ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [producto_id, cantidad, costo_unitario, costo_total, descripcion, usuario_id, fecha]);
    return result.lastID;
  }

  /**
   * Registrar salida de producto (RF43)
   */
  static async registrarSalida({ producto_id, cantidad, proyecto_id, descripcion, usuario_id, fecha }) {
    // Obtener costo del producto
    const producto = await db.get('SELECT costo_unitario FROM productos WHERE id = ?', [producto_id]);
    const costo_total = cantidad * (producto?.costo_unitario || 0);

    const query = `
      INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, costo_unitario, costo_total, proyecto_id, descripcion, usuario_id, fecha)
      VALUES (?, 'salida', ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      producto_id, 
      cantidad, 
      producto?.costo_unitario || 0, 
      costo_total, 
      proyecto_id, 
      descripcion, 
      usuario_id, 
      fecha
    ]);
    return result.lastID;
  }

  /**
   * Obtener todos los movimientos
   */
  static async findAll() {
    const query = `
      SELECT m.*, p.nombre as producto_nombre, p.unidad, u.nombre as usuario_nombre,
             pr.nombre as proyecto_nombre
      FROM movimientos_inventario m
      INNER JOIN productos p ON m.producto_id = p.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN proyectos pr ON m.proyecto_id = pr.id
      ORDER BY m.fecha DESC, m.created_at DESC
    `;
    return await db.all(query);
  }

  /**
   * Obtener movimientos por producto (RF08)
   */
  static async findByProducto(producto_id) {
    const query = `
      SELECT m.*, p.nombre as producto_nombre, p.unidad, u.nombre as usuario_nombre,
             pr.nombre as proyecto_nombre
      FROM movimientos_inventario m
      INNER JOIN productos p ON m.producto_id = p.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN proyectos pr ON m.proyecto_id = pr.id
      WHERE m.producto_id = ?
      ORDER BY m.fecha DESC, m.created_at DESC
    `;
    return await db.all(query, [producto_id]);
  }

  /**
   * Obtener movimientos por proyecto
   */
  static async findByProyecto(proyecto_id) {
    const query = `
      SELECT m.*, p.nombre as producto_nombre, p.unidad, u.nombre as usuario_nombre
      FROM movimientos_inventario m
      INNER JOIN productos p ON m.producto_id = p.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.proyecto_id = ?
      ORDER BY m.fecha DESC, m.created_at DESC
    `;
    return await db.all(query, [proyecto_id]);
  }

  /**
   * Obtener movimientos por tipo (RF09 - filtración)
   */
  static async findByTipo(tipo) {
    const query = `
      SELECT m.*, p.nombre as producto_nombre, p.unidad, u.nombre as usuario_nombre,
             pr.nombre as proyecto_nombre
      FROM movimientos_inventario m
      INNER JOIN productos p ON m.producto_id = p.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN proyectos pr ON m.proyecto_id = pr.id
      WHERE m.tipo = ?
      ORDER BY m.fecha DESC, m.created_at DESC
    `;
    return await db.all(query, [tipo]);
  }

  /**
   * Obtener movimientos por rango de fechas (RF09 - filtración)
   */
  static async findByDateRange(fecha_inicio, fecha_fin) {
    const query = `
      SELECT m.*, p.nombre as producto_nombre, p.unidad, u.nombre as usuario_nombre,
             pr.nombre as proyecto_nombre
      FROM movimientos_inventario m
      INNER JOIN productos p ON m.producto_id = p.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN proyectos pr ON m.proyecto_id = pr.id
      WHERE m.fecha BETWEEN ? AND ?
      ORDER BY m.fecha DESC, m.created_at DESC
    `;
    return await db.all(query, [fecha_inicio, fecha_fin]);
  }

  /**
   * Obtener resumen de movimientos por producto
   */
  static async getResumenByProducto(producto_id) {
    const query = `
      SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) as total_salidas,
        SUM(CASE WHEN tipo = 'entrada' THEN costo_total ELSE 0 END) as costo_entradas,
        SUM(CASE WHEN tipo = 'salida' THEN costo_total ELSE 0 END) as costo_salidas
      FROM movimientos_inventario
      WHERE producto_id = ?
    `;
    return await db.get(query, [producto_id]);
  }

  /**
   * Obtener estadísticas generales del inventario
   */
  static async getEstadisticas() {
    const query = `
      SELECT 
        COUNT(DISTINCT producto_id) as productos_movidos,
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) as total_salidas,
        SUM(CASE WHEN tipo = 'entrada' THEN costo_total ELSE 0 END) as valor_entradas,
        SUM(CASE WHEN tipo = 'salida' THEN costo_total ELSE 0 END) as valor_salidas
      FROM movimientos_inventario
    `;
    return await db.get(query);
  }

  /**
   * Eliminar movimiento
   */
  static async delete(id) {
    const query = 'DELETE FROM movimientos_inventario WHERE id = ?';
    const result = await db.run(query, [id]);
    return result.changes > 0;
  }
}

module.exports = InventoryModel;
