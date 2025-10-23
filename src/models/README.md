# 📁 CARPETA: MODELS

## Propósito
Contiene los **modelos de datos** que interactúan directamente con la base de datos.

## Responsabilidades
- Definir la estructura de las tablas (esquema)
- Ejecutar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
- Validar integridad de datos antes de guardar
- Abstraer consultas SQL complejas

## Estructura esperada
```
models/
├── userModel.js              → Sprint 1: Tabla usuarios y operaciones
├── roleModel.js              → Sprint 1: Tabla roles y permisos
├── projectModel.js           → Sprint 2: Tabla proyectos
├── phaseModel.js             → Sprint 2: Tabla fases
├── milestoneModel.js         → Sprint 2: Tabla hitos
├── resourceModel.js          → Sprint 3: Tabla recursos
├── budgetModel.js            → Sprint 3: Tabla presupuestos
├── productModel.js           → Sprint 4: Tabla productos
├── providerModel.js          → Sprint 4: Tabla proveedores
└── inventoryModel.js         → Sprint 4: Tabla inventario
```

## Principios
- **Encapsulación**: Toda interacción con BD pasa por modelos
- **Reutilización**: Funciones genéricas (findById, findAll, create, update, delete)
- **Validación**: Verificar datos antes de insertar/actualizar
- **Integridad referencial**: Respetar relaciones entre tablas

## Ejemplo de estructura de un modelo
```javascript
// Ejemplo: userModel.js (Sprint 1)
const db = require('../db/database');

class UserModel {
  // Crear tabla (se ejecuta en migración inicial)
  static async createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS usuarios (...)`;
    await db.run(sql);
  }

  // Operaciones CRUD
  static async findById(id) { ... }
  static async findAll() { ... }
  static async create(userData) { ... }
  static async update(id, userData) { ... }
  static async delete(id) { ... }
}

module.exports = UserModel;
```

## Notas académicas
- Cada modelo representa UNA tabla
- No duplicar lógica entre modelos
- Usar nombres descriptivos en español para claridad
