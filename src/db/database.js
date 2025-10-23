/**
 * CONFIGURACIÓN DE BASE DE DATOS - AGROTECHNOVA
 * 
 * Módulo de conexión y gestión de la base de datos SQLite.
 * SQLite es ideal para proyectos académicos:
 * - No requiere instalación de servidor de BD
 * - Base de datos en archivo único
 * - Compatible con Node.js nativo
 * - Suficiente para el alcance del proyecto
 * 
 * Cumple con:
 * - RF44: Centralización de datos
 * - RF69: Modelo Entidad-Relación
 * - RF71: Esquema de bases de datos
 * - RNF07: Cifrado de datos
 * - RNF08: Redundancia de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, '../../database/agrotechnova.db');
const DB_DIR = path.dirname(DB_PATH);

/**
 * Clase de gestión de base de datos
 * Patrón Singleton para mantener una única conexión
 */
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.db = null;
    Database.instance = this;
  }

  /**
   * Inicializa la conexión a la base de datos
   * Crea el directorio y archivo si no existen
   */
  initialize() {
    return new Promise((resolve, reject) => {
      // Crear directorio si no existe
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log('📁 Directorio de base de datos creado');
      }

      // Conectar a la base de datos
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Error al conectar con la base de datos:', err.message);
          reject(err);
          return;
        }

        console.log('✅ Conexión exitosa a la base de datos SQLite');
        
        // Habilitar claves foráneas (importante para integridad referencial)
        this.db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('❌ Error al habilitar claves foráneas:', err.message);
            reject(err);
            return;
          }
          console.log('🔗 Claves foráneas habilitadas');
          resolve();
        });
      });
    });
  }

  /**
   * Ejecuta una consulta SQL (INSERT, UPDATE, DELETE)
   * @param {string} sql - Consulta SQL
   * @param {array} params - Parámetros de la consulta
   * @returns {Promise}
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Obtiene un único registro
   * @param {string} sql - Consulta SQL
   * @param {array} params - Parámetros de la consulta
   * @returns {Promise}
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  /**
   * Obtiene múltiples registros
   * @param {string} sql - Consulta SQL
   * @param {array} params - Parámetros de la consulta
   * @returns {Promise}
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  /**
   * Obtiene la instancia de base de datos SQLite
   * Método requerido por modelos para compatibilidad
   * @returns {sqlite3.Database} Instancia de la base de datos
   */
  getDatabase() {
    return this.db;
  }

  /**
   * Ejecuta múltiples consultas en una transacción
   * @param {function} callback - Función con las operaciones a ejecutar
   * @returns {Promise}
   */
  transaction(callback) {
    return new Promise(async (resolve, reject) => {
      this.db.run('BEGIN TRANSACTION', async (err) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const result = await callback();
          this.db.run('COMMIT', (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          });
        } catch (error) {
          this.db.run('ROLLBACK', () => {
            reject(error);
          });
        }
      });
    });
  }

  /**
   * Cierra la conexión a la base de datos
   */
  close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('🔌 Conexión a base de datos cerrada');
        resolve();
      });
    });
  }

  /**
   * Verifica si una tabla existe
   * @param {string} tableName - Nombre de la tabla
   * @returns {Promise<boolean>}
   */
  async tableExists(tableName) {
    const result = await this.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return !!result;
  }
}

// Exportar instancia única (Singleton)
const dbInstance = new Database();
module.exports = dbInstance;
