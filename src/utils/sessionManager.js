/**
 * GESTOR DE SESIONES - AGROTECHNOVA
 * 
 * Manejo de sesiones de usuario sin JWT.
 * Usa un Map en memoria para almacenar sesiones activas.
 * 
 * NOTA: En producción se debería usar Redis o similar.
 * Para este proyecto académico, memoria es suficiente.
 */

const crypto = require('crypto');

/**
 * Almacén de sesiones activas
 * Key: sessionId
 * Value: { userId, email, rol, createdAt, lastActivity }
 */
const activeSessions = new Map();

/**
 * Configuración de sesiones
 */
const SESSION_CONFIG = {
  expirationTime: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
  inactivityTime: 2 * 60 * 60 * 1000   // 2 horas de inactividad
};

/**
 * Crea una nueva sesión para un usuario
 * 
 * @param {object} userData - Datos del usuario { id, email, rol }
 * @returns {string} - Session ID
 */
function createSession(userData) {
  // Generar ID de sesión único
  const sessionId = crypto.randomBytes(32).toString('hex');

  // Crear sesión
  const session = {
    userId: userData.id,
    email: userData.email,
    nombre: userData.nombre,
    rol: userData.rol,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  // Almacenar en el Map
  activeSessions.set(sessionId, session);

  console.log(`✅ Sesión creada para usuario ${userData.email} (ID: ${sessionId.substring(0, 8)}...)`);

  return sessionId;
}

/**
 * Valida y obtiene una sesión activa
 * 
 * @param {string} sessionId - ID de la sesión
 * @returns {object|null} - Datos de la sesión o null si no es válida
 */
function getSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = activeSessions.get(sessionId);

  if (!session) {
    return null;
  }

  const now = Date.now();

  // Verificar expiración total
  if (now - session.createdAt > SESSION_CONFIG.expirationTime) {
    activeSessions.delete(sessionId);
    console.log(`⏱️ Sesión expirada (total): ${sessionId.substring(0, 8)}...`);
    return null;
  }

  // Verificar inactividad
  if (now - session.lastActivity > SESSION_CONFIG.inactivityTime) {
    activeSessions.delete(sessionId);
    console.log(`⏱️ Sesión expirada (inactividad): ${sessionId.substring(0, 8)}...`);
    return null;
  }

  // Actualizar última actividad
  session.lastActivity = now;
  activeSessions.set(sessionId, session);

  return session;
}

/**
 * Destruye una sesión (logout)
 * 
 * @param {string} sessionId - ID de la sesión
 * @returns {boolean} - true si se eliminó, false si no existía
 */
function destroySession(sessionId) {
  if (!sessionId) {
    return false;
  }

  const existed = activeSessions.has(sessionId);

  if (existed) {
    activeSessions.delete(sessionId);
    console.log(`🔒 Sesión cerrada: ${sessionId.substring(0, 8)}...`);
  }

  return existed;
}

/**
 * Obtiene todas las sesiones activas de un usuario
 * 
 * @param {number} userId - ID del usuario
 * @returns {array} - Array de session IDs
 */
function getUserSessions(userId) {
  const userSessions = [];

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      userSessions.push(sessionId);
    }
  }

  return userSessions;
}

/**
 * Destruye todas las sesiones de un usuario
 * Útil cuando se desactiva un usuario
 * 
 * @param {number} userId - ID del usuario
 * @returns {number} - Cantidad de sesiones eliminadas
 */
function destroyUserSessions(userId) {
  const userSessions = getUserSessions(userId);

  userSessions.forEach(sessionId => {
    activeSessions.delete(sessionId);
  });

  console.log(`🔒 ${userSessions.length} sesión(es) cerrada(s) para usuario ID ${userId}`);

  return userSessions.length;
}

/**
 * Limpia sesiones expiradas
 * Se ejecuta periódicamente
 */
function cleanExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (
      now - session.createdAt > SESSION_CONFIG.expirationTime ||
      now - session.lastActivity > SESSION_CONFIG.inactivityTime
    ) {
      activeSessions.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 ${cleanedCount} sesión(es) expirada(s) eliminada(s)`);
  }
}

/**
 * Inicia limpieza periódica de sesiones
 * Se ejecuta cada 15 minutos
 */
function startSessionCleaner() {
  const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutos

  setInterval(() => {
    cleanExpiredSessions();
  }, CLEANUP_INTERVAL);

  console.log('🧹 Limpiador de sesiones iniciado (cada 15 minutos)');
}

/**
 * Obtiene estadísticas de sesiones
 * 
 * @returns {object}
 */
function getSessionStats() {
  return {
    totalSessions: activeSessions.size,
    sessions: Array.from(activeSessions.entries()).map(([id, session]) => ({
      sessionId: id.substring(0, 8) + '...',
      userId: session.userId,
      email: session.email,
      rol: session.rol,
      createdAt: new Date(session.createdAt).toLocaleString(),
      lastActivity: new Date(session.lastActivity).toLocaleString()
    }))
  };
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  getUserSessions,
  destroyUserSessions,
  startSessionCleaner,
  getSessionStats
};
