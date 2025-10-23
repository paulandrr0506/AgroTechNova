/**
 * MODELO: Proveedores (Sprint 4 - RF16, RF18)
 * Gestión de proveedores de insumos y productos
 */

const db = require('../db/database');

class ProviderModel {
  /**
   * Crear tabla de proveedores
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS proveedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        nit TEXT UNIQUE,
        contacto TEXT,
        telefono TEXT,
        correo TEXT,
        direccion TEXT,
        tipo_productos TEXT,
        estado TEXT DEFAULT 'activo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await db.run(query);
      console.log('✅ Tabla "proveedores" creada correctamente');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Tabla "proveedores" ya existe');
      } else {
        console.error('❌ Error creando tabla proveedores:', error);
        throw error;
      }
    }
  }

  /**
   * Crear un nuevo proveedor (RF16)
   */
  static async create({ nombre, nit, contacto, telefono, correo, direccion, tipo_productos }) {
    const query = `
      INSERT INTO proveedores (nombre, nit, contacto, telefono, correo, direccion, tipo_productos)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [nombre, nit, contacto, telefono, correo, direccion, tipo_productos]);
    return result.lastID;
  }

  /**
   * Obtener todos los proveedores
   */
  static async findAll() {
    const query = 'SELECT * FROM proveedores ORDER BY nombre ASC';
    return await db.all(query);
  }

  /**
   * Obtener proveedores activos
   */
  static async findActive() {
    const query = 'SELECT * FROM proveedores WHERE estado = ? ORDER BY nombre ASC';
    return await db.all(query, ['activo']);
  }

  /**
   * Buscar proveedor por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM proveedores WHERE id = ?';
    return await db.get(query, [id]);
  }

  /**
   * Buscar proveedor por nombre
   */
  static async findByNombre(nombre) {
    const query = 'SELECT * FROM proveedores WHERE nombre = ?';
    return await db.get(query, [nombre]);
  }

  /**
   * Buscar proveedor por NIT
   */
  static async findByNit(nit) {
    const query = 'SELECT * FROM proveedores WHERE nit = ?';
    return await db.get(query, [nit]);
  }

  /**
   * Actualizar proveedor
   */
  static async update(id, { nombre, nit, contacto, telefono, correo, direccion, tipo_productos, estado }) {
    const query = `
      UPDATE proveedores 
      SET nombre = ?, nit = ?, contacto = ?, telefono = ?, correo = ?, 
          direccion = ?, tipo_productos = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await db.run(query, [nombre, nit, contacto, telefono, correo, direccion, tipo_productos, estado, id]);
    return result.changes > 0;
  }

  /**
   * Eliminar proveedor (solo si no tiene productos asociados)
   */
  static async delete(id) {
    const query = 'DELETE FROM proveedores WHERE id = ?';
    const result = await db.run(query, [id]);
    return result.changes > 0;
  }

  /**
   * Desactivar proveedor
   */
  static async deactivate(id) {
    const query = 'UPDATE proveedores SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await db.run(query, ['inactivo', id]);
    return result.changes > 0;
  }

  /**
   * Activar proveedor
   */
  static async activate(id) {
    const query = 'UPDATE proveedores SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await db.run(query, ['activo', id]);
    return result.changes > 0;
  }
}

module.exports = ProviderModel;
