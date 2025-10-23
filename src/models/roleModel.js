/**
 * MODELO DE ROLES - AGROTECHNOVA
 * 
 * Gestión de roles y permisos del sistema.
 * 
 * Cumple con:
 * - RF49: Gestión de permisos por rol
 * - RNF16: Control de accesos
 */

const db = require('../db/database');

class RoleModel {
  /**
   * Crea la tabla de roles
   * Solo se ejecuta al inicializar la BD
   */
  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        permisos TEXT
      )
    `;

    try {
      await db.run(sql);
      console.log('✅ Tabla "roles" creada correctamente');
    } catch (error) {
      console.error('❌ Error al crear tabla roles:', error.message);
      throw error;
    }
  }

  /**
   * Inserta los roles por defecto del sistema
   */
  static async seedDefaultRoles() {
    const roles = [
      {
        id: 1,
        nombre: 'administrador',
        descripcion: 'Acceso total al sistema',
        permisos: JSON.stringify({
          usuarios: ['crear', 'leer', 'actualizar', 'eliminar', 'activar', 'desactivar'],
          proyectos: ['crear', 'leer', 'actualizar', 'eliminar'],
          recursos: ['crear', 'leer', 'actualizar', 'eliminar'],
          inventario: ['crear', 'leer', 'actualizar', 'eliminar'],
          reportes: ['generar', 'exportar'],
          sistema: ['configurar', 'backup']
        })
      },
      {
        id: 2,
        nombre: 'asesor',
        descripcion: 'Asesor técnico de proyectos',
        permisos: JSON.stringify({
          usuarios: ['leer'],
          proyectos: ['leer', 'actualizar'],
          recursos: ['leer', 'actualizar'],
          inventario: ['leer'],
          reportes: ['generar'],
          sistema: []
        })
      },
      {
        id: 3,
        nombre: 'productor',
        descripcion: 'Productor agroindustrial',
        permisos: JSON.stringify({
          usuarios: [],
          proyectos: ['crear', 'leer', 'actualizar'], // Solo sus proyectos
          recursos: ['leer', 'actualizar'],
          inventario: ['leer', 'actualizar'],
          reportes: ['generar'],
          sistema: []
        })
      }
    ];

    try {
      for (const rol of roles) {
        // Verificar si el rol ya existe
        const exists = await db.get('SELECT id FROM roles WHERE id = ?', [rol.id]);

        if (!exists) {
          await db.run(
            'INSERT INTO roles (id, nombre, descripcion, permisos) VALUES (?, ?, ?, ?)',
            [rol.id, rol.nombre, rol.descripcion, rol.permisos]
          );
          console.log(`✅ Rol "${rol.nombre}" insertado`);
        }
      }
    } catch (error) {
      console.error('❌ Error al insertar roles por defecto:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene todos los roles
   * 
   * @returns {Promise<Array>}
   */
  static async findAll() {
    try {
      const roles = await db.all('SELECT * FROM roles ORDER BY id');
      
      // Parsear permisos de JSON a objeto
      return roles.map(rol => ({
        ...rol,
        permisos: JSON.parse(rol.permisos || '{}')
      }));
    } catch (error) {
      console.error('❌ Error al obtener roles:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un rol por ID
   * 
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    try {
      const rol = await db.get('SELECT * FROM roles WHERE id = ?', [id]);
      
      if (!rol) {
        return null;
      }

      return {
        ...rol,
        permisos: JSON.parse(rol.permisos || '{}')
      };
    } catch (error) {
      console.error('❌ Error al obtener rol:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un rol por nombre
   * 
   * @param {string} nombre
   * @returns {Promise<Object|null>}
   */
  static async findByName(nombre) {
    try {
      const rol = await db.get('SELECT * FROM roles WHERE nombre = ?', [nombre]);
      
      if (!rol) {
        return null;
      }

      return {
        ...rol,
        permisos: JSON.parse(rol.permisos || '{}')
      };
    } catch (error) {
      console.error('❌ Error al obtener rol por nombre:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si un rol tiene un permiso específico
   * 
   * @param {number} rolId - ID del rol
   * @param {string} modulo - Nombre del módulo (ej: 'usuarios')
   * @param {string} accion - Acción (ej: 'crear', 'leer')
   * @returns {Promise<boolean>}
   */
  static async hasPermission(rolId, modulo, accion) {
    try {
      const rol = await this.findById(rolId);
      
      if (!rol) {
        return false;
      }

      const permisos = rol.permisos;
      
      if (!permisos[modulo]) {
        return false;
      }

      return permisos[modulo].includes(accion);
    } catch (error) {
      console.error('❌ Error al verificar permiso:', error.message);
      return false;
    }
  }
}

module.exports = RoleModel;
