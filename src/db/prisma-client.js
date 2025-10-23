/**
 * CONFIGURACIÓN DE PRISMA CLIENT - AGROTECHNOVA
 * 
 * Cliente de Prisma ORM para MySQL.
 * Reemplaza la conexión SQLite anterior.
 * 
 * Ventajas:
 * - Type-safe queries
 * - Migraciones automáticas
 * - Relaciones simplificadas
 * - Mejor rendimiento con MySQL
 * - Escalable para producción
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Instancia global de Prisma Client
 * Patrón Singleton para reutilizar la conexión
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo, usar global para evitar múltiples instancias
  // durante hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'], // Logs útiles en desarrollo
    });
  }
  prisma = global.prisma;
}

/**
 * Función para desconectar Prisma
 * Útil al cerrar la aplicación
 */
async function disconnect() {
  await prisma.$disconnect();
  console.log('🔌 Conexión a MySQL cerrada');
}

// Manejar señales de cierre
process.on('beforeExit', async () => {
  await disconnect();
});

module.exports = prisma;
