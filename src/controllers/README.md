# 📁 CARPETA: CONTROLLERS

## Propósito
Contiene los **controladores** que manejan la lógica de negocio de la aplicación.

## Responsabilidades
- Recibir las solicitudes desde las rutas
- Procesar datos de entrada (validar, limpiar)
- Interactuar con los modelos para consultar/modificar la base de datos
- Devolver respuestas estructuradas al cliente

## Estructura esperada
```
controllers/
├── authController.js        → Sprint 1: Login, registro, recuperación de contraseña
├── userController.js         → Sprint 1: Gestión de usuarios y permisos
├── projectController.js      → Sprint 2: CRUD de proyectos
├── phaseController.js        → Sprint 2: Gestión de fases de proyecto
├── resourceController.js     → Sprint 3: Gestión de recursos y presupuestos
├── inventoryController.js    → Sprint 4: Control de inventario e insumos
└── reportController.js       → Sprint 5: Generación de reportes
```

## Principios
- **Separación de responsabilidades**: Cada controlador maneja un módulo específico
- **Código limpio**: Funciones cortas y descriptivas
- **Sin lógica de datos**: Los controladores NO ejecutan SQL directamente, usan modelos
- **Manejo de errores**: Capturar excepciones y devolver mensajes claros

## Ejemplo de estructura de un controlador
```javascript
// Ejemplo: authController.js (Sprint 1)
const UserModel = require('../models/userModel');

async function login(req, res) {
  try {
    // 1. Validar datos de entrada
    // 2. Consultar modelo
    // 3. Devolver respuesta
  } catch (error) {
    // Manejo de errores
  }
}

module.exports = { login };
```

## Notas académicas
- Evitar sobrearquitecturar: mantener funciones simples
- Comentarios claros para facilitar revisión
- Cada función debe tener un propósito único y claro
