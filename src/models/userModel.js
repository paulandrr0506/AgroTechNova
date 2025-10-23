/**
 * MODELO DE USUARIOS - AGROTECHNOVA
 * 
 * Gestión de usuarios del sistema.
 * 
 * Cumple con:
 * - RF39: Actualización de la lista de usuarios
 * - RF40: Modificación de datos de usuario
 * - RF48: Usuario administrador por defecto
 * - RF51: Activar y desactivar usuarios
 * - RF58: Autenticación segura
 * - RNF07: Cifrado de datos
 */

const db = require('../db/database');
const { hashPassword } = require('../utils/crypto');

class UserModel {
  /**
   * Crea la tabla de usuarios
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        rol_id INTEGER NOT NULL DEFAULT 3,
        estado VARCHAR(20) DEFAULT 'activo',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso DATETIME,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
      )
    `;

    try {
      await db.run(sql);
      console.log('✅ Tabla "usuarios" creada correctamente');
    } catch (error) {
      console.error('❌ Error al crear tabla usuarios:', error.message);
      throw error;
    }
  }

  /**
   * Crea el usuario administrador por defecto (RF48)
   */
  static async seedDefaultAdmin() {
    const adminData = {
      nombre: 'Administrador',
      email: 'admin@agrotechnova.com',
      password: 'Admin123!', // Contraseña por defecto (debe cambiarse)
      rol_id: 1 // Rol de administrador
    };

    try {
      // Verificar si ya existe un admin
      const existingAdmin = await db.get(
        'SELECT id FROM usuarios WHERE email = ?',
        [adminData.email]
      );

      if (existingAdmin) {
        console.log('ℹ️  Usuario administrador ya existe');
        return;
      }

      // Crear hash de la contraseña
      const passwordHash = hashPassword(adminData.password);

      // Insertar usuario administrador
      await db.run(
        `INSERT INTO usuarios (nombre, email, password_hash, rol_id, estado) 
         VALUES (?, ?, ?, ?, ?)`,
        [adminData.nombre, adminData.email, passwordHash, adminData.rol_id, 'activo']
      );

      console.log('✅ Usuario administrador creado:');
      console.log(`   📧 Email: ${adminData.email}`);
      console.log(`   🔑 Password: ${adminData.password}`);
      console.log('   ⚠️  CAMBIAR CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
    } catch (error) {
      console.error('❌ Error al crear usuario administrador:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios con información de rol
   * 
   * @returns {Promise<Array>}
   */
  static async findAll() {
    try {
      const sql = `
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.rol_id,
          r.nombre as rol_nombre,
          u.estado,
          u.fecha_creacion,
          u.fecha_modificacion,
          u.ultimo_acceso
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        ORDER BY u.id
      `;

      const usuarios = await db.all(sql);
      return usuarios;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   * 
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.rol_id,
          r.nombre as rol_nombre,
          u.estado,
          u.fecha_creacion,
          u.fecha_modificacion,
          u.ultimo_acceso
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.id = ?
      `;

      const usuario = await db.get(sql, [id]);
      return usuario || null;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por email (para login)
   * Incluye password_hash para verificación
   * 
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.password_hash,
          u.rol_id,
          r.nombre as rol_nombre,
          u.estado,
          u.ultimo_acceso
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.email = ?
      `;

      const usuario = await db.get(sql, [email.toLowerCase()]);
      return usuario || null;
    } catch (error) {
      console.error('❌ Error al obtener usuario por email:', error.message);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario (RF39)
   * 
   * @param {Object} userData - { nombre, email, password, rol_id }
   * @returns {Promise<number>} - ID del usuario creado
   */
  static async create(userData) {
    try {
      // Validar que el email no exista
      const existing = await this.findByEmail(userData.email);
      if (existing) {
        throw new Error('El email ya está registrado');
      }

      // Crear hash de la contraseña
      const passwordHash = hashPassword(userData.password);

      // Insertar usuario
      const sql = `
        INSERT INTO usuarios (nombre, email, password_hash, rol_id, estado)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await db.run(sql, [
        userData.nombre,
        userData.email.toLowerCase(),
        passwordHash,
        userData.rol_id || 3, // Por defecto: productor
        'activo'
      ]);

      console.log(`✅ Usuario creado: ${userData.email} (ID: ${result.id})`);
      return result.id;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario (RF40)
   * 
   * @param {number} id
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<boolean>}
   */
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];

      // Construir query dinámicamente
      if (updates.nombre) {
        fields.push('nombre = ?');
        values.push(updates.nombre);
      }

      if (updates.email) {
        // Verificar que el email no esté en uso por otro usuario
        const existing = await db.get(
          'SELECT id FROM usuarios WHERE email = ? AND id != ?',
          [updates.email.toLowerCase(), id]
        );

        if (existing) {
          throw new Error('El email ya está en uso');
        }

        fields.push('email = ?');
        values.push(updates.email.toLowerCase());
      }

      if (updates.rol_id) {
        fields.push('rol_id = ?');
        values.push(updates.rol_id);
      }

      // Actualizar fecha de modificación
      fields.push('fecha_modificacion = CURRENT_TIMESTAMP');

      if (fields.length === 1) { // Solo fecha_modificacion
        return false;
      }

      values.push(id);

      const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
      const result = await db.run(sql, values);

      console.log(`✅ Usuario actualizado (ID: ${id})`);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   * 
   * @param {number} id
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  static async updatePassword(id, newPassword) {
    try {
      const passwordHash = hashPassword(newPassword);

      const sql = `
        UPDATE usuarios 
        SET password_hash = ?, fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await db.run(sql, [passwordHash, id]);

      console.log(`✅ Contraseña actualizada (ID: ${id})`);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error.message);
      throw error;
    }
  }

  /**
   * Cambia el estado de un usuario (RF51)
   * 
   * @param {number} id
   * @param {string} estado - 'activo' o 'inactivo'
   * @returns {Promise<boolean>}
   */
  static async changeStatus(id, estado) {
    try {
      const sql = `
        UPDATE usuarios 
        SET estado = ?, fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await db.run(sql, [estado, id]);

      console.log(`✅ Estado de usuario cambiado a "${estado}" (ID: ${id})`);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza la fecha de último acceso
   * 
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async updateLastAccess(id) {
    try {
      const sql = 'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?';
      await db.run(sql, [id]);
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar último acceso:', error.message);
      return false;
    }
  }

  /**
   * Elimina un usuario (no se usa, se prefiere desactivar)
   * 
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      // No eliminar al admin principal
      if (id === 1) {
        throw new Error('No se puede eliminar el usuario administrador principal');
      }

      const sql = 'DELETE FROM usuarios WHERE id = ?';
      const result = await db.run(sql, [id]);

      console.log(`✅ Usuario eliminado (ID: ${id})`);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error.message);
      throw error;
    }
  }

  /**
   * Cuenta los usuarios por rol
   * 
   * @returns {Promise<Object>}
   */
  static async countByRole() {
    try {
      const sql = `
        SELECT 
          r.nombre as rol,
          COUNT(u.id) as cantidad
        FROM roles r
        LEFT JOIN usuarios u ON r.id = u.rol_id
        GROUP BY r.id, r.nombre
      `;

      const counts = await db.all(sql);
      
      const result = {};
      counts.forEach(row => {
        result[row.rol] = row.cantidad;
      });

      return result;
    } catch (error) {
      console.error('❌ Error al contar usuarios:', error.message);
      throw error;
    }
  }
}

module.exports = UserModel;
