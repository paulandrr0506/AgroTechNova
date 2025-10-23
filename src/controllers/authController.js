/**
 * CONTROLADOR DE AUTENTICACIÓN - AGROTECHNOVA
 * 
 * Maneja login, logout, verificación de sesión y recuperación de contraseña.
 * 
 * Cumple con:
 * - RF58: Inicio de sesión con autenticación segura
 * - RF59: Recuperación de contraseña por correo electrónico
 * - RNF07: Cifrado de datos
 * - RNF16: Autenticación y control de accesos
 */

const UserModel = require('../models/userModel');
const LogModel = require('../models/logModel');
const { verifyPassword, generateToken } = require('../utils/crypto');
const { createSession, destroySession, getSession } = require('../utils/sessionManager');
const { isValidEmail, isNotEmpty } = require('../utils/validators');

class AuthController {
  /**
   * POST /api/auth/login
   * Inicia sesión de usuario
   */
  static async login(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);

        // Validaciones básicas
        if (!isValidEmail(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email inválido' }));
          return;
        }

        if (!isNotEmpty(password)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Contraseña requerida' }));
          return;
        }

        // Buscar usuario en la base de datos
        const usuario = await UserModel.findByEmail(email);

        if (!usuario) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
          return;
        }

        // Verificar que el usuario esté activo (RF51)
        if (usuario.estado !== 'activo') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Usuario inactivo. Contacte al administrador.' }));
          return;
        }

        // Verificar contraseña
        const isValid = verifyPassword(password, usuario.password_hash);

        if (!isValid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
          return;
        }

        // Actualizar último acceso
        await UserModel.updateLastAccess(usuario.id);

        // Crear sesión
        const sessionId = createSession({
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol_nombre
        });

        // Configurar cookie de sesión (HttpOnly para seguridad)
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
        });

        res.end(JSON.stringify({
          success: true,
          message: 'Inicio de sesión exitoso',
          user: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol_nombre
          }
        }));

        // Registrar log de inicio de sesión exitoso
        await LogModel.logLogin(usuario.id, req.socket.remoteAddress, true);

        console.log(`✅ Login exitoso: ${usuario.email}`);

      } catch (error) {
        console.error('❌ Error en login:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor' }));
      }
    });
  }

  /**
   * POST /api/auth/logout
   * Cierra sesión de usuario
   */
  static async logout(req, res) {
    try {
      // Obtener cookie de sesión
      const cookies = req.headers.cookie || '';
      const sessionId = cookies.split('; ')
        .find(row => row.startsWith('sessionId='))
        ?.split('=')[1];

      let userId = null;
      if (sessionId) {
        const session = getSession(sessionId);
        userId = session?.id;
        destroySession(sessionId);
        
        // Registrar log de cierre de sesión
        if (userId) {
          await LogModel.logLogout(userId, req.socket.remoteAddress);
        }
      }

      // Eliminar cookie
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
      });

      res.end(JSON.stringify({ 
        success: true, 
        message: 'Sesión cerrada exitosamente' 
      }));

      console.log(`🔒 Logout exitoso`);

    } catch (error) {
      console.error('❌ Error en logout:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al cerrar sesión' }));
    }
  }

  /**
   * GET /api/auth/session
   * Verifica si hay una sesión activa
   */
  static async checkSession(req, res) {
    try {
      const cookies = req.headers.cookie || '';
      const sessionId = cookies.split('; ')
        .find(row => row.startsWith('sessionId='))
        ?.split('=')[1];

      if (!sessionId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: false }));
        return;
      }

      const session = getSession(sessionId);

      if (!session) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: false }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authenticated: true,
        user: {
          id: session.userId,  // ✅ CORRECCIÓN: session tiene 'userId', no 'id'
          email: session.email,
          nombre: session.nombre,
          rol: session.rol
        }
      }));

    } catch (error) {
      console.error('❌ Error en checkSession:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al verificar sesión' }));
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Recuperación de contraseña (RF59)
   * NOTA: Simulado sin envío real de email (académico)
   */
  static async forgotPassword(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body);

        if (!isValidEmail(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email inválido' }));
          return;
        }

        // Verificar que el usuario existe
        const usuario = await UserModel.findByEmail(email);

        // Generar token de recuperación
        const resetToken = generateToken();

        // En producción, aquí se enviaría el email con el token
        // Para este proyecto académico, solo se registra en consola
        if (usuario) {
          console.log(`🔑 Token de recuperación generado para ${email}:`);
          console.log(`   Token: ${resetToken}`);
          console.log(`   Usuario ID: ${usuario.id}`);
          console.log(`   ⚠️  En producción, este token se enviaría por email`);
        }

        // Siempre responder lo mismo (seguridad - RF59)
        // No revelar si el email existe o no
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña.'
        }));

      } catch (error) {
        console.error('❌ Error en forgot-password:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al procesar solicitud' }));
      }
    });
  }
}

module.exports = AuthController;
