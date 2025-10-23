# 📁 CARPETA: DB

## Propósito
Gestiona la **conexión y configuración** de la base de datos.

## Responsabilidades
- Establecer conexión con SQLite
- Proporcionar interfaz para ejecutar consultas
- Gestionar transacciones
- Manejar cierre de conexiones
- Ejecutar migraciones de tablas

## Archivos principales
```
db/
├── database.js               → Clase de conexión y operaciones BD (YA CREADO)
└── migrations.js             → Sprint 1+: Ejecutar creación de tablas
```

## Principios
- **Patrón Singleton**: Una única instancia de conexión
- **Integridad referencial**: Claves foráneas habilitadas
- **Transacciones**: Para operaciones críticas
- **Manejo de errores**: Captura y logging de errores de BD

## Estructura de database.js (ya implementado)
- `initialize()`: Conecta a la BD y crea archivo si no existe
- `run(sql, params)`: Ejecuta INSERT, UPDATE, DELETE
- `get(sql, params)`: Obtiene un registro
- `all(sql, params)`: Obtiene múltiples registros
- `transaction(callback)`: Ejecuta operaciones en transacción
- `close()`: Cierra conexión
- `tableExists(name)`: Verifica si una tabla existe

## Uso en modelos
```javascript
const db = require('../db/database');

// Consulta simple
const user = await db.get('SELECT * FROM usuarios WHERE id = ?', [userId]);

// Inserción
const result = await db.run(
  'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
  [nombre, email]
);

// Transacción
await db.transaction(async () => {
  await db.run('INSERT INTO ...');
  await db.run('UPDATE ...');
});
```

## Notas académicas
- SQLite es ideal para proyectos académicos (sin servidor externo)
- Base de datos almacenada en `database/agrotechnova.db`
- Usar prepared statements SIEMPRE para evitar SQL injection
