/**
 * CONTROLADOR DE USUARIOS - AGROTECHNOVA
 * 
 * Gestión CRUD de usuarios del sistema.
 * 
 * Cumple con:
 * - RF39: Actualización de la lista de usuarios
 * - RF40: Modificación de datos de usuario
 * - RF51: Activar y desactivar usuarios
 * - RF49: Gestión de permisos por rol
 */

const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { validatePasswordStrength } = require('../utils/crypto');
const { isValidEmail, isNotEmpty, isValidId, isValidRole, isValidEstado } = require('../utils/validators');
const { destroyUserSessions } = require('../utils/sessionManager');

class UserController {
  /**
   * GET /api/users
   * Lista todos los usuarios (solo admin - RF39)
   */
  static async list(req, res) {
    try {
      const usuarios = await UserModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        users: usuarios,
        count: usuarios.length
      }));

    } catch (error) {
      console.error('❌ Error al listar usuarios:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener usuarios' }));
    }
  }

  /**
   * GET /api/users/:id
   * Obtiene un usuario específico
   */
  static async getById(req, res, userId) {
    try {
      if (!isValidId(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID inválido' }));
        return;
      }

      const usuario = await UserModel.findById(userId);

      if (!usuario) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: usuario
      }));

    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener usuario' }));
    }
  }

  /**
   * POST /api/users
   * Crea un nuevo usuario (solo admin - RF39)
   */
  static async create(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { nombre, email, password, rol_id } = JSON.parse(body);

        // Validaciones
        if (!isNotEmpty(nombre, 3)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre debe tener al menos 3 caracteres' }));
          return;
        }

        if (!isValidEmail(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email inválido' }));
          return;
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: passwordValidation.message }));
          return;
        }

        if (rol_id && !isValidRole(rol_id)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Rol inválido' }));
          return;
        }

        // Crear usuario
        const userId = await UserModel.create({
          nombre,
          email,
          password,
          rol_id: rol_id || 3 // Por defecto: productor
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Usuario creado exitosamente',
          userId
        }));

        console.log(`✅ Usuario creado: ${email} (ID: ${userId})`);

      } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        
        if (error.message.includes('email')) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error al crear usuario' }));
        }
      }
    });
  }

  /**
   * PUT /api/users/:id
   * Actualiza un usuario (RF40)
   */
  static async update(req, res, userId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(userId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const updates = JSON.parse(body);

        // Validaciones
        if (updates.nombre && !isNotEmpty(updates.nombre, 3)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'El nombre debe tener al menos 3 caracteres' }));
          return;
        }

        if (updates.email && !isValidEmail(updates.email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email inválido' }));
          return;
        }

        if (updates.rol_id && !isValidRole(updates.rol_id)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Rol inválido' }));
          return;
        }

        // Actualizar
        const success = await UserModel.update(userId, updates);

        if (!success) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Usuario actualizado exitosamente'
        }));

        console.log(`✅ Usuario actualizado (ID: ${userId})`);

      } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al actualizar usuario' }));
      }
    });
  }

  /**
   * PATCH /api/users/:id/status
   * Activa o desactiva un usuario (RF51)
   */
  static async changeStatus(req, res, userId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(userId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const { estado } = JSON.parse(body);

        if (!isValidEstado(estado)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Estado inválido (debe ser "activo" o "inactivo")' }));
          return;
        }

        // No permitir desactivar al admin principal
        if (userId === '1' && estado === 'inactivo') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No se puede desactivar el administrador principal' }));
          return;
        }

        const success = await UserModel.changeStatus(userId, estado);

        if (!success) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
          return;
        }

        // Si se desactiva, cerrar todas sus sesiones (RF51)
        if (estado === 'inactivo') {
          destroyUserSessions(parseInt(userId));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
        }));

        console.log(`✅ Estado cambiado a "${estado}" (ID: ${userId})`);

      } catch (error) {
        console.error('❌ Error al cambiar estado:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al cambiar estado del usuario' }));
      }
    });
  }

  /**
   * PATCH /api/users/:id/password
   * Cambia la contraseña de un usuario
   */
  static async changePassword(req, res, userId) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!isValidId(userId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const { newPassword } = JSON.parse(body);

        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: passwordValidation.message }));
          return;
        }

        const success = await UserModel.updatePassword(userId, newPassword);

        if (!success) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Contraseña actualizada exitosamente'
        }));

        console.log(`✅ Contraseña cambiada (ID: ${userId})`);

      } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al cambiar contraseña' }));
      }
    });
  }

  /**
   * GET /api/roles
   * Lista todos los roles disponibles
   */
  static async getRoles(req, res) {
    try {
      const roles = await RoleModel.findAll();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        roles
      }));

    } catch (error) {
      console.error('❌ Error al obtener roles:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener roles' }));
    }
  }
}

module.exports = UserController;
