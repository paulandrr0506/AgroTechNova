# 📁 CARPETA: MIDDLEWARES

## Propósito
Contiene funciones **middleware** que procesan solicitudes antes de llegar a los controladores.

## Responsabilidades
- Autenticación (verificar tokens, sesiones)
- Autorización (verificar permisos por rol)
- Validación de datos de entrada
- Logging de peticiones
- Manejo de errores centralizado
- CORS y seguridad

## Estructura esperada
```
middlewares/
├── authMiddleware.js         → Sprint 1: Verificar sesión/token
├── roleMiddleware.js         → Sprint 1: Verificar permisos por rol
├── validationMiddleware.js   → Sprint 1+: Validar datos de entrada
├── errorMiddleware.js        → Sprint 1+: Manejo de errores global
└── corsMiddleware.js         → Sprint 1+: Configuración CORS
```

## Principios
- **Reutilización**: Un middleware puede usarse en múltiples rutas
- **Orden de ejecución**: Los middlewares se ejecutan secuencialmente
- **Next pattern**: Si un middleware no maneja la solicitud, debe llamar al siguiente

## Ejemplo de estructura de middleware
```javascript
// Ejemplo: authMiddleware.js (Sprint 1)
function authenticateUser(req) {
  // 1. Extraer token/sesión de headers o cookies
  // 2. Validar token
  // 3. Adjuntar usuario a req.user si es válido
  // 4. Retornar true si autenticado, false si no
}

function requireAuth(req, res) {
  if (!authenticateUser(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No autorizado' }));
    return false;
  }
  return true;
}

module.exports = { requireAuth, authenticateUser };
```

## Notas académicas
- Mantener middlewares simples y específicos
- No incluir lógica de negocio aquí (eso va en controladores)
- Facilitar el testing aislado de cada middleware
