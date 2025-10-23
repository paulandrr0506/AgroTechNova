# 📁 CARPETA: ROUTES

## Propósito
Define las **rutas HTTP** de la API REST.

## Responsabilidades
- Mapear URLs a funciones de controladores
- Definir métodos HTTP permitidos (GET, POST, PUT, DELETE)
- Aplicar middlewares de autenticación/autorización
- Validar parámetros de URL

## Estructura esperada
```
routes/
├── authRoutes.js             → Sprint 1: /api/auth/login, /api/auth/register
├── userRoutes.js             → Sprint 1: /api/users/*
├── projectRoutes.js          → Sprint 2: /api/projects/*
├── phaseRoutes.js            → Sprint 2: /api/phases/*
├── resourceRoutes.js         → Sprint 3: /api/resources/*
├── inventoryRoutes.js        → Sprint 4: /api/inventory/*
└── reportRoutes.js           → Sprint 5: /api/reports/*
```

## Principios
- **RESTful**: Seguir convenciones REST
  - GET: consultar
  - POST: crear
  - PUT/PATCH: actualizar
  - DELETE: eliminar
- **Nomenclatura clara**: URLs descriptivas
- **Modularidad**: Una ruta por módulo funcional

## Ejemplo de estructura de rutas
```javascript
// Ejemplo: authRoutes.js (Sprint 1)
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

function setupAuthRoutes(req, res) {
  const { method, pathname } = req;

  if (pathname === '/api/auth/login' && method === 'POST') {
    return authController.login(req, res);
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    return authController.register(req, res);
  }

  // Ruta no encontrada
  return false;
}

module.exports = setupAuthRoutes;
```

## Notas académicas
- Sin usar Express Router, implementar manualmente
- Validar método HTTP antes de ejecutar controlador
- Retornar `false` si la ruta no coincide (para delegar a siguiente módulo)
