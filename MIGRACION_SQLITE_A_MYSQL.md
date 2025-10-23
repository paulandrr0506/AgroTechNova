# 📊 Migración de SQLite a MySQL con Prisma ORM

```
┌─────────────────────────────────────┐
│     Aplicación Node.js              │
│  (src/models/*.js, controllers)     │
└──────────────┬──────────────────────┘
               │
               │ Prisma Client
               ▼
┌─────────────────────────────────────┐
│         Prisma ORM                  │
│  • Query Building                   │
│  • Type Generation                  │
│  • Migration Management             │
└──────────────┬──────────────────────┘
               │
               │ Database Connector
               ▼
┌─────────────────────────────────────┐
│      Base de Datos MySQL            │
│    localhost:3306/agrotechnova      │
└─────────────────────────────────────┘
```

## ✅ Infraestructura Preparada

### 1. Base de Datos MySQL Creada

```sql
-- Base de datos: agrotechnova
-- Host: localhost:3306
-- Usuario: root
-- Password: root (desarrollo local)
```

**Estado:**
- ✅ Base de datos creada
- ✅ 14 tablas migradas
- ✅ Datos migrados (25 registros de prueba)
- ✅ Relaciones configuradas
- ✅ Índices creados

### 2. Schema de Prisma Configurado

📄 **Archivo**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 14 modelos definidos:
model Role { ... }
model User { ... }
model ProjectCategory { ... }
model Project { ... }
model Phase { ... }
model Milestone { ... }
model Resource { ... }
model Budget { ... }
model Expense { ... }
model Task { ... }
model TaskAssignment { ... }
model Provider { ... }
model Product { ... }
model InventoryMovement { ... }
```

**Características del Schema:**
- ✅ Tipos de datos MySQL optimizados
- ✅ Relaciones 1-a-muchos y muchos-a-muchos
- ✅ Campos opcionales vs requeridos
- ✅ Valores por defecto
- ✅ Reglas de eliminación en cascada
- ✅ Mapeo de nombres (camelCase ↔ snake_case)

### 3. Cliente de Prisma Configurado

📄 **Archivo**: `src/db/prisma-client.js`

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
```

**Características:**
- ✅ Singleton pattern (una sola instancia)
- ✅ Logging habilitado para desarrollo
- ✅ Reutilización en hot-reload
- ✅ Cierre automático al terminar

### 4. Variables de Entorno

📄 **Archivo**: `.env`

```env
# Base de datos MySQL - Local
DATABASE_URL="mysql://root:root@localhost:3306/agrotechnova"

# Puerto del servidor
PORT=3000
```

### 5. Migraciones Aplicadas

```
📂 prisma/migrations/
   ├── migration_lock.toml
   ├── 20251023000950_init/
   │   └── migration.sql (Creación inicial de tablas)
   └── 20251023001338_make_budget_categoria_optional/
       └── migration.sql (Ajuste de campos opcionales)
```

---

## 🔄 Proceso de Migración Realizado

### Fase 1: Instalación ✅ Completada

```bash
# Instalación de dependencias
npm install prisma @prisma/client mysql2

# Inicialización de Prisma
npx prisma init
```

### Fase 2: Configuración de Schema ✅ Completada

1. Análisis de estructura SQLite (18 tablas)
2. Creación de `schema.prisma` con 14 modelos
3. Mapeo de tipos de datos SQLite → MySQL
4. Configuración de relaciones y constraints

### Fase 3: Creación de Base de Datos ✅ Completada

```bash
# Generación del cliente Prisma
npx prisma generate

# Aplicación de migraciones
npx prisma migrate dev --name init
```

**Resultado:**
```
✅ Base de datos 'agrotechnova' creada
✅ 14 tablas creadas en MySQL
✅ Prisma Client generado (node_modules/.prisma/client)
```

### Fase 4: Migración de Datos ✅ Completada

📄 **Script**: `migrate-to-mysql.js`

```bash
node migrate-to-mysql.js
```

**Datos Migrados:**
- ✅ 3 roles (Administrador, Gerente, Usuario)
- ✅ 3 usuarios (con contraseñas hasheadas)
- ✅ 4 categorías de proyecto
- ✅ 3 proyectos de prueba
- ✅ 5 recursos
- ✅ 2 presupuestos
- ✅ 4 gastos
- ✅ 1 proveedor

**Total: 25 registros migrados exitosamente**

### Fase 5: Verificación ✅ Completada

```bash
# Verificar conexión
npx prisma db pull

# Ver datos en Prisma Studio
npx prisma studio
```

