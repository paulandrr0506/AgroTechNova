# 🌾 AgroTechNova - Plataforma de Gestión Agroindustrial

**Proyecto Integrador 1 - Universidad Pontificia Bolivariana**

Sistema web para la gestión integral de proyectos agroindustriales, recursos, presupuestos e inventario.

---

## � Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Plan de Desarrollo por Sprints](#-plan-de-desarrollo-por-sprints)
- [Requerimientos Implementados](#-requerimientos-implementados)

---

## 🎯 Descripción del Proyecto

AgroTechNova es una plataforma web diseñada para centralizar la gestión de proyectos agroindustriales, permitiendo:

- ✅ Gestión de usuarios con roles y permisos
- ✅ Control de proyectos por fases y hitos
- ✅ Administración de recursos y presupuestos
- ✅ Inventario de insumos y productos
- ✅ Generación de reportes y métricas
- ✅ Sistema de asesorías y colaboración

**Contexto Académico:** Proyecto Integrador 1  
**Institución:** Universidad Pontificia Bolivariana  
**Enfoque:** Código limpio, modular y académico (sin frameworks externos)

---

## 📁 Estructura del Proyecto

```
AgroSpinoff2/
│
├── 📄 server.js                    # Servidor HTTP principal (Node.js puro)
├── 📄 package.json                 # Configuración del proyecto
├── 📄 .env.example                 # Variables de entorno de ejemplo
├── 📄 .gitignore                   # Archivos ignorados por git
│
├── 📁 src/                         # CÓDIGO BACKEND
│   ├── 📁 controllers/             # Lógica de negocio
│   │   └── README.md               # Documentación de controladores
│   ├── 📁 models/                  # Modelos de datos (BD)
│   │   └── README.md               # Documentación de modelos
│   ├── 📁 routes/                  # Rutas de la API REST
│   │   └── README.md               # Documentación de rutas
│   ├── 📁 middlewares/             # Autenticación, validación, etc.
│   │   └── README.md               # Documentación de middlewares
│   ├── 📁 utils/                   # Funciones utilitarias
│   │   └── README.md               # Documentación de utils
│   └── 📁 db/                      # Configuración de base de datos
│       ├── database.js             # Clase de conexión SQLite
│       └── README.md               # Documentación de BD
│
├── 📁 database/                    # Base de datos SQLite (auto-generada)
│   └── agrotechnova.db             # Archivo de base de datos
│
├── 📁 pages/                       # CÓDIGO FRONTEND (HTML)
│   ├── Pagina.html                 # Página principal
│   ├── login.html                  # Inicio de sesión
│   ├── register.html               # Registro de usuarios
│   ├── dashboard.html              # Panel principal
│   ├── agendaReuniones.html        # Programación de reuniones
│   ├── contacto.html               # Página de contacto
│   ├── mision-vision.html          # Misión y visión
│   ├── objetivos.html              # Objetivos del proyecto
│   └── servicios.html              # Servicios ofrecidos
│
├── 📁 public/                      # ARCHIVOS ESTÁTICOS
│   ├── 📁 css/                     # Hojas de estilo
│   │   ├── Pagina.css
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   └── ...
│   └── 📁 js/                      # Scripts del frontend
│
├── 📁 images/                      # IMÁGENES
│   ├── logo.png
│   ├── campo1.jpg
│   ├── campo2.jpg
│   └── fondo.png
│
└── 📁 temp/                        # DOCUMENTACIÓN TEMPORAL
    └── REQUERIMIENTOS FINAL (1).txt
```

---

## 💻 Tecnologías Utilizadas

### Backend
- **Node.js** (v14+) - Servidor HTTP nativo
- **SQLite3** - Base de datos relacional
- **Crypto (nativo)** - Cifrado de contraseñas

### Frontend
- **HTML5** - Estructura de páginas
- **CSS3** - Estilos y diseño responsive
- **JavaScript Vanilla** - Interactividad del cliente

### Sin Frameworks
- ❌ No Express
- ❌ No React/Vue/Angular
- ❌ No Bootstrap/Tailwind
- ✅ Solo tecnologías nativas

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd AgroSpinoff2
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (opcional)
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Iniciar el servidor
```bash
npm start
```

### 5. Acceder a la aplicación
Abrir en el navegador: `http://127.0.0.1:3000`

---

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño
**Arquitectura en Capas Simplificada (sin MVC estricto)**

```
┌─────────────────────────────────────────┐
│         CLIENTE (Navegador)             │
│    HTML + CSS + JavaScript Vanilla      │
└────────────────┬────────────────────────┘
                 │ HTTP/HTTPS
┌────────────────▼────────────────────────┐
│         SERVIDOR (Node.js)              │
│  ┌─────────────────────────────────┐   │
│  │  Routes (Enrutamiento)          │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Middlewares (Auth, Validación) │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Controllers (Lógica Negocio)   │   │
│  └──────────┬──────────────────────┘   │
│  ┌──────────▼──────────────────────┐   │
│  │  Models (Acceso a Datos)        │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│      BASE DE DATOS (SQLite)            │
│       agrotechnova.db                  │
└────────────────────────────────────────┘
```

### Flujo de una Petición

1. **Cliente** envía petición HTTP (ej: POST /api/auth/login)
2. **Servidor** recibe y parsea la petición
3. **Routes** identifica la ruta y dirige al controlador
4. **Middlewares** validan autenticación/autorización
5. **Controller** procesa la lógica de negocio
6. **Model** ejecuta consultas a la base de datos
7. **Controller** formatea respuesta
8. **Servidor** envía respuesta JSON al cliente

---

## 📆 Plan de Desarrollo por Sprints

### Sprint 1 - Autenticación y Base del Sistema ✅ (Estructura Creada)
**Requerimientos:** RF58, RF59, RF48, RF40, RF39, RF51, RF49 + RNF01, 05, 07, 11, 16  
**Tablas:** usuarios, roles  
**Funcionalidades:**
- Login y registro de usuarios
- Cifrado de contraseñas
- Gestión de roles y permisos
- Recuperación de contraseña

### Sprint 2 - Gestión de Proyectos (Próximo)
**Requerimientos:** RF41, RF13, RF62, RF25, RF23, RF15, RF70, RF71  
**Tablas:** proyectos, fases, hitos  
**Funcionalidades:**
- CRUD de proyectos
- División por fases
- Seguimiento de hitos
- Búsqueda y filtrado

### Sprint 3 - Recursos y Presupuestos
**Requerimientos:** RF01, RF02, RF03, RF04, RF05, RF17, RF19, RF32, RF33  
**Tablas:** recursos, presupuestos, gastos, asignaciones_personal  
**Funcionalidades:**
- Planificación de recursos
- Control de presupuesto
- Asignación de personal
- Comparación de gastos

### Sprint 4 - Inventario y Proveedores
**Requerimientos:** RF06, RF08, RF09, RF16, RF18, RF43, RF45, RF29, RF31  
**Tablas:** productos, proveedores, inventario, insumos, maquinaria  
**Funcionalidades:**
- Catálogo de productos
- Registro de proveedores
- Control de inventario
- Insumos orgánicos/químicos

### Sprint 5 - Reportes y Visualización
**Requerimientos:** RF28, RF52, RF53, RF54, RF55, RF56, RF57, RF60, RF61  
**Funcionalidades:**
- Generación de reportes PDF/Excel
- Visualización de proyectos finalizados
- Catálogo de servicios
- Información institucional

### Sprint 6 - Funcionalidades Avanzadas
**Requerimientos:** RF34, RF35, RF36, RF37, RF44, RF46, RF64, RF66  
**Funcionalidades:**
- Programación de reuniones
- Copias de seguridad
- Monitoreo del sistema
- Integración con APIs externas

---

## 📊 Requerimientos Implementados

### Estado Actual: SPRINT 0 - Estructura Base ✅

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Servidor HTTP | ✅ | Node.js puro sin Express |
| Base de datos | ✅ | SQLite configurado |
| Estructura backend | ✅ | Carpetas organizadas |
| Frontend base | ✅ | HTML/CSS existente |
| Documentación | ✅ | README por carpeta |

### Próximos Pasos
- [ ] Sprint 1: Implementar autenticación
- [ ] Sprint 2: Implementar gestión de proyectos
- [ ] Sprint 3: Implementar recursos y presupuestos
- [ ] Sprint 4: Implementar inventario
- [ ] Sprint 5: Implementar reportes
- [ ] Sprint 6: Funcionalidades avanzadas

---

## 📝 Páginas Disponibles

### Páginas Públicas
- **`/`** - Página principal (Pagina.html)
- **`/pages/mision-vision.html`** - Misión y visión
- **`/pages/objetivos.html`** - Objetivos del proyecto
- **`/pages/servicios.html`** - Servicios ofrecidos
- **`/pages/contacto.html`** - Información de contacto

### Páginas de Autenticación
- **`/pages/login.html`** - Inicio de sesión
- **`/pages/register.html`** - Registro de usuarios

### Páginas Protegidas (requieren autenticación)
- **`/pages/dashboard.html`** - Panel principal
- **`/pages/agendaReuniones.html`** - Programación de reuniones

---

## 🔐 Seguridad

- ✅ Cifrado de contraseñas con crypto nativo
- ✅ Prepared statements para prevenir SQL injection
- ✅ Validación de datos de entrada
- ✅ Control de sesiones
- ✅ Integridad referencial en BD

---

## 👥 Equipo de Desarrollo

**AgroTechNova Team**  
Universidad Pontificia Bolivariana  
Proyecto Integrador 1

---

## 📄 Licencia

MIT License - Proyecto Académico
- **dashboard.html** - Panel de control del usuario
- **mision-vision.html** - Misión y visión de la empresa
- **objetivos.html** - Objetivos de AgroTechNova
- **servicios.html** - Servicios ofrecidos
- **contacto.html** - Formulario de contacto
- **agendaReuniones.html** - Agenda de reuniones

## 🎨 Características

- ✅ CSS separado por página para mejor mantenibilidad
- ✅ Imágenes organizadas en carpeta dedicada
- ✅ Rutas relativas correctamente configuradas
- ✅ Estructura escalable y profesional
- ✅ Diseño responsive
- ✅ Font Awesome para iconos

## ⚠️ Nota importante

Los archivos HTML antiguos en la raíz del proyecto pueden ser eliminados ya que las versiones actualizadas están en la carpeta `pages/` con las rutas correctas.

## 🔗 Rutas importantes

- **Desde pages/ hacia CSS**: `../public/css/[archivo].css`
- **Desde pages/ hacia imágenes**: `../images/[imagen]`
- **Enlaces entre páginas HTML**: Usar nombres de archivo directamente (ej: `login.html`)

---
**Desarrollado por**: AgroTechNova Team
**Fecha**: Octubre 2025
