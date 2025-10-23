/**
 * SERVIDOR PRINCIPAL - AGROTECHNOVA
 * 
 * Archivo de inicialización del servidor HTTP usando Node.js puro.
 * Sin frameworks externos (no Express).
 * 
 * Funcionalidades:
 * - Servir archivos estáticos (HTML, CSS, JS, imágenes)
 * - Manejar rutas API REST
 * - Integrar con módulos de rutas definidos en /src/routes
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Importar configuración de base de datos y rutas
const Database = require('./src/db/database');
const { initDatabase } = require('./src/db/migrations');
const handleAuthRoutes = require('./src/routes/authRoutes');
const handleUserRoutes = require('./src/routes/userRoutes');
const { handleProjectRoutes } = require('./src/routes/projectRoutes');
const { handlePhaseRoutes } = require('./src/routes/phaseRoutes');
const { handleMilestoneRoutes } = require('./src/routes/milestoneRoutes');
const handleResourceRoutes = require('./src/routes/resourceRoutes');
const handleBudgetRoutes = require('./src/routes/budgetRoutes');
const handleExpenseRoutes = require('./src/routes/expenseRoutes');
const handleProviderRoutes = require('./src/routes/providerRoutes');
const handleProductRoutes = require('./src/routes/productRoutes');
const handleInventoryRoutes = require('./src/routes/inventoryRoutes');
const handleReportRoutes = require('./src/routes/reportRoutes');
const handleTicketRoutes = require('./src/routes/ticketRoutes');
const handleLogRoutes = require('./src/routes/logRoutes');
const handleAdminRoutes = require('./src/routes/adminRoutes');
const { startSessionCleaner } = require('./src/utils/sessionManager');

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

/**
 * Tipos MIME para servir archivos estáticos correctamente
 */
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

/**
 * Función para servir archivos estáticos
 * @param {string} filePath - Ruta del archivo solicitado
 * @param {object} res - Objeto de respuesta HTTP
 */
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Archivo no encontrado</h1>');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Función para manejar rutas API
 * @param {object} req - Objeto de solicitud HTTP
 * @param {object} res - Objeto de respuesta HTTP
 */
function handleAPIRoutes(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Habilitar CORS para desarrollo (eliminar en producción)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight OPTIONS
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rutas de autenticación (/api/auth/*)
  if (pathname.startsWith('/api/auth/')) {
    handleAuthRoutes(pathname, method, req, res);
    return;
  }

  // Rutas de usuarios (/api/users/* y /api/roles)
  if (pathname.startsWith('/api/users/') || pathname === '/api/users' || pathname === '/api/roles') {
    handleUserRoutes(pathname, method, req, res);
    return;
  }

  // Rutas de proyectos (/api/projects/*)
  if (pathname.startsWith('/api/projects')) {
    handleProjectRoutes(req, res);
    return;
  }

  // Rutas de fases (/api/phases/* o /api/projects/:id/phases)
  if (pathname.startsWith('/api/phases') || pathname.match(/\/api\/projects\/\d+\/(phases|progress)/)) {
    handlePhaseRoutes(req, res);
    return;
  }

  // Rutas de hitos (/api/milestones/* o /api/phases/:id/milestones o /api/projects/:id/milestones)
  if (pathname.startsWith('/api/milestones') || 
      pathname.match(/\/api\/phases\/\d+\/milestones/) ||
      pathname.match(/\/api\/projects\/\d+\/(milestones|stats)/)) {
    handleMilestoneRoutes(req, res);
    return;
  }

  // Rutas de recursos (/api/resources/*)
  if (pathname.startsWith('/api/resources')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleResourceRoutes(req, res, urlParts);
    return;
  }

  // Rutas de presupuesto (/api/budget/*)
  if (pathname.startsWith('/api/budget')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleBudgetRoutes(req, res, urlParts);
    return;
  }

  // Rutas de gastos (/api/expenses/*)
  if (pathname.startsWith('/api/expenses')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleExpenseRoutes(req, res, urlParts);
    return;
  }

  // Rutas de proveedores (/api/providers/*) - Sprint 4
  if (pathname.startsWith('/api/providers')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleProviderRoutes(req, res, method, pathname, urlParts);
    return;
  }

  // Rutas de productos (/api/products/*) - Sprint 4
  if (pathname.startsWith('/api/products')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleProductRoutes(req, res, method, pathname, urlParts);
    return;
  }

  // Rutas de inventario (/api/inventory/*) - Sprint 4
  if (pathname.startsWith('/api/inventory')) {
    const urlParts = pathname.split('/').filter(part => part);
    handleInventoryRoutes(req, res, method, pathname, urlParts);
    return;
  }

  // Rutas de reportes (/api/reports/*) - Sprint 5
  if (pathname.startsWith('/api/reports')) {
    handleReportRoutes(req, res);
    return;
  }

  // Rutas de tickets (/api/tickets/*) - Sprint 6
  if (pathname.startsWith('/api/tickets')) {
    handleTicketRoutes(req, res, url.parse(req.url, true));
    return;
  }

  // Rutas de logs (/api/logs/*) - Sprint 6
  if (pathname.startsWith('/api/logs')) {
    handleLogRoutes(req, res, url.parse(req.url, true));
    return;
  }

  // Rutas de administración (/api/admin/*) - Sprint 6
  if (pathname.startsWith('/api/admin')) {
    handleAdminRoutes(req, res, url.parse(req.url, true));
    return;
  }

  // Ruta API no encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta API no encontrada' }));
}

/**
 * Servidor HTTP principal
 */
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Manejar rutas API primero
  if (pathname.startsWith('/api/')) {
    handleAPIRoutes(req, res);
    return;
  }

  // Redirecciones amigables para páginas comunes
  if (pathname === '/') {
    pathname = '/pages/Pagina.html';
  } else if (pathname === '/login' || pathname === '/login.html') {
    pathname = '/pages/login.html';
  } else if (pathname === '/register' || pathname === '/register.html') {
    pathname = '/pages/register.html';
  } else if (pathname === '/dashboard' || pathname === '/dashboard.html') {
    pathname = '/pages/dashboard.html';
  } else if (pathname === '/usuarios' || pathname === '/usuarios.html') {
    pathname = '/pages/usuarios.html';
  } else if (pathname === '/proyectos' || pathname === '/proyectos.html') {
    pathname = '/pages/proyectos.html';
  } else if (pathname === '/fases' || pathname === '/fases.html') {
    pathname = '/pages/fases.html';
  } else if (pathname === '/hitos' || pathname === '/hitos.html') {
    pathname = '/pages/hitos.html';
  } else if (pathname === '/recursos' || pathname === '/recursos.html') {
    pathname = '/pages/recursos.html';
  } else if (pathname === '/presupuestos' || pathname === '/presupuestos.html') {
    pathname = '/pages/presupuestos.html';
  } else if (pathname === '/gastos' || pathname === '/gastos.html') {
    pathname = '/pages/gastos.html';
  } else if (pathname === '/proveedores' || pathname === '/proveedores.html') {
    pathname = '/pages/proveedores.html';
  } else if (pathname === '/productos' || pathname === '/productos.html') {
    pathname = '/pages/productos.html';
  } else if (pathname === '/inventario' || pathname === '/inventario.html') {
    pathname = '/pages/inventario.html';
  } else if (pathname === '/agendaReuniones' || pathname === '/agendaReuniones.html') {
    pathname = '/pages/agendaReuniones.html';
  } else if (pathname === '/test-sprint6' || pathname === '/test-sprint6.html') {
    pathname = '/pages/test-sprint6.html';
  } else if (pathname === '/soporte' || pathname === '/soporte.html') {
    pathname = '/pages/soporte.html';
  } else if (pathname === '/panelAdmin' || pathname === '/panelAdmin.html') {
    pathname = '/pages/panelAdmin.html';
  } else if (pathname === '/actividad' || pathname === '/actividad.html') {
    pathname = '/pages/actividad.html';
  } else if (pathname === '/contacto' || pathname === '/contacto.html') {
    pathname = '/pages/contacto.html';
  } else if (pathname === '/mision-vision' || pathname === '/mision-vision.html') {
    pathname = '/pages/mision-vision.html';
  } else if (pathname === '/objetivos' || pathname === '/objetivos.html') {
    pathname = '/pages/objetivos.html';
  } else if (pathname === '/servicios' || pathname === '/servicios.html') {
    pathname = '/pages/servicios.html';
  } else if (pathname === '/reportes' || pathname === '/reportes.html') {
    pathname = '/pages/reportes.html';
  } else if (pathname === '/proyectosFinalizados' || pathname === '/proyectosFinalizados.html') {
    pathname = '/pages/proyectosFinalizados.html';
  } else if (pathname === '/catalogo' || pathname === '/catalogo.html') {
    pathname = '/pages/catalogo.html';
  }

  // Construir ruta del archivo
  const filePath = path.join(__dirname, pathname);

  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Página no encontrada</h1>');
      return;
    }

    // Servir el archivo
    serveStaticFile(filePath, res);
  });
});

/**
 * Inicializar base de datos y arrancar servidor
 */
async function startServer() {
  try {
    console.log('🔧 Inicializando base de datos...');
    
    // Inicializar base de datos SQLite
    await Database.initialize();
    await initDatabase();
    
    console.log('✅ Base de datos lista');

    // Iniciar limpiador de sesiones (cada 15 minutos)
    startSessionCleaner();
    console.log('✅ Limpiador de sesiones activo');

    // Iniciar servidor HTTP
    server.listen(PORT, HOST, () => {
      console.log('='.repeat(50));
      console.log('🚀 SERVIDOR AGROTECHNOVA INICIADO');
      console.log('='.repeat(50));
      console.log(`📡 Servidor corriendo en: http://${HOST}:${PORT}`);
      console.log(`📂 Directorio base: ${__dirname}`);
      console.log(`⏰ Hora de inicio: ${new Date().toLocaleString()}`);
      console.log('='.repeat(50));
      console.log('📋 ENDPOINTS DISPONIBLES:');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/auth/logout');
      console.log('   GET  /api/auth/session');
      console.log('   POST /api/auth/forgot-password');
      console.log('   GET  /api/users (admin)');
      console.log('   POST /api/users (admin)');
      console.log('   GET  /api/roles (autenticado)');
      console.log('='.repeat(50));
      console.log('Presiona CTRL+C para detener el servidor');
      console.log('='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

/**
 * Manejo de cierre del servidor
 */
process.on('SIGINT', () => {
  console.log('\n\n🛑 Cerrando servidor...');
  server.close(() => {
    Database.close();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    Database.close();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
