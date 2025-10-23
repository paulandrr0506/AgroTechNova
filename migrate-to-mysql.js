/**
 * MIGRACIÓN A MYSQL CON PRISMA
 * 
 * Este script:
 * 1. Crea la base de datos en MySQL
 * 2. Ejecuta las migraciones de Prisma
 * 3. Migra los datos existentes de SQLite a MySQL
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const db = require('./src/db/database');
const { hashPassword } = require('./src/utils/crypto');

const prisma = new PrismaClient();

// Helper para convertir fechas de SQLite a objetos Date válidos
function parseDate(dateString) {
  if (!dateString) return new Date(); // Si no hay fecha, usar fecha actual
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date; // Si es inválida, usar fecha actual
}

async function migrateData() {
  console.log('🚀 Iniciando migración de datos de SQLite a MySQL...\n');

  try {
    // 1. Migrar Roles
    console.log('📦 Migrando roles...');
    const sqliteRoles = await db.all('SELECT * FROM roles');
    for (const role of sqliteRoles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: {},
        create: {
          id: role.id,
          nombre: role.nombre,
          descripcion: role.descripcion || null,
          permisos: role.permisos || '{}',
          // Roles en SQLite no tienen fechas, usar fecha actual
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    console.log(`✅ ${sqliteRoles.length} roles migrados\n`);

    // 2. Migrar Usuarios
    console.log('📦 Migrando usuarios...');
    const sqliteUsers = await db.all('SELECT * FROM usuarios');
    for (const user of sqliteUsers) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          passwordHash: user.password_hash,
          rolId: user.rol_id,
          estado: user.estado || 'activo',
          createdAt: parseDate(user.fecha_creacion),
          updatedAt: parseDate(user.fecha_modificacion),
          ultimoAcceso: user.ultimo_acceso ? parseDate(user.ultimo_acceso) : null
        }
      });
    }
    console.log(`✅ ${sqliteUsers.length} usuarios migrados\n`);

    // 3. Migrar Categorías de Proyecto
    console.log('📦 Migrando categorías de proyecto...');
    const sqliteCategories = await db.all('SELECT * FROM categorias_proyecto');
    for (const cat of sqliteCategories) {
      await prisma.projectCategory.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          nombre: cat.nombre,
          descripcion: cat.descripcion || null,
          createdAt: parseDate(cat.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqliteCategories.length} categorías migradas\n`);

    // 4. Migrar Proyectos
    console.log('📦 Migrando proyectos...');
    const sqliteProjects = await db.all('SELECT * FROM proyectos');
    for (const proj of sqliteProjects) {
      await prisma.project.upsert({
        where: { id: proj.id },
        update: {},
        create: {
          id: proj.id,
          nombre: proj.nombre,
          descripcion: proj.descripcion || null,
          categoriaId: proj.categoria_id,
          responsableId: proj.responsable_id,
          fechaInicio: parseDate(proj.fecha_inicio),
          fechaFin: proj.fecha_fin ? parseDate(proj.fecha_fin) : null,
          presupuesto: proj.presupuesto ? parseFloat(proj.presupuesto) : 0,
          estado: proj.estado || 'planificacion',
          prioridad: proj.prioridad || 'media',
          ubicacion: proj.ubicacion || null,
          objetivos: proj.objetivos || null,
          alcance: proj.alcance || null,
          riesgos: proj.riesgos || null,
          createdAt: parseDate(proj.fecha_creacion),
          updatedAt: parseDate(proj.fecha_modificacion)
        }
      });
    }
    console.log(`✅ ${sqliteProjects.length} proyectos migrados\n`);

    // 5. Migrar Fases
    console.log('📦 Migrando fases...');
    const sqlitePhases = await db.all('SELECT * FROM fases');
    for (const phase of sqlitePhases) {
      await prisma.phase.upsert({
        where: { id: phase.id },
        update: {},
        create: {
          id: phase.id,
          proyectoId: phase.proyecto_id,
          nombre: phase.nombre,
          descripcion: phase.descripcion || null,
          fechaInicio: parseDate(phase.fecha_inicio),
          fechaFin: phase.fecha_fin ? parseDate(phase.fecha_fin) : null,
          estado: phase.estado || 'pendiente',
          orden: phase.orden || 1,
          createdAt: parseDate(phase.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqlitePhases.length} fases migradas\n`);

    // 6. Migrar Hitos
    console.log('📦 Migrando hitos...');
    const sqliteMilestones = await db.all('SELECT * FROM hitos');
    for (const milestone of sqliteMilestones) {
      await prisma.milestone.upsert({
        where: { id: milestone.id },
        update: {},
        create: {
          id: milestone.id,
          proyectoId: milestone.proyecto_id,
          faseId: milestone.fase_id || null,
          nombre: milestone.nombre,
          descripcion: milestone.descripcion || null,
          fechaLimite: parseDate(milestone.fecha_limite),
          estado: milestone.estado || 'pendiente',
          progreso: milestone.progreso || 0,
          prioridad: milestone.prioridad || 'media',
          createdAt: parseDate(milestone.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqliteMilestones.length} hitos migrados\n`);

    // 7. Migrar Recursos
    console.log('📦 Migrando recursos...');
    const sqliteResources = await db.all('SELECT * FROM recursos');
    for (const resource of sqliteResources) {
      await prisma.resource.upsert({
        where: { id: resource.id },
        update: {},
        create: {
          id: resource.id,
          proyectoId: resource.proyecto_id,
          nombre: resource.nombre,
          tipo: resource.tipo || 'material',
          cantidad: resource.cantidad || 0,
          unidad: resource.unidad || 'unidad',
          costoUnitario: resource.costo_unitario ? parseFloat(resource.costo_unitario) : 0,
          costoTotal: resource.costo_total ? parseFloat(resource.costo_total) : 0,
          proveedor: resource.proveedor || null,
          estado: resource.estado || 'disponible',
          descripcion: resource.descripcion || null,
          createdAt: parseDate(resource.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqliteResources.length} recursos migrados\n`);

    // 8. Migrar Presupuestos
    console.log('📦 Migrando presupuestos...');
    const sqliteBudgets = await db.all('SELECT * FROM presupuestos');
    for (const budget of sqliteBudgets) {
      await prisma.budget.upsert({
        where: { id: budget.id },
        update: {},
        create: {
          id: budget.id,
          proyectoId: budget.proyecto_id,
          categoria: budget.categoria || null, // SQLite no tiene este campo
          montoAsignado: budget.monto_asignado || budget.monto_total ? parseFloat(budget.monto_asignado || budget.monto_total) : 0,
          montoGastado: budget.monto_gastado ? parseFloat(budget.monto_gastado) : 0,
          montoDisponible: budget.monto_disponible ? parseFloat(budget.monto_disponible) : 0,
          descripcion: budget.descripcion || null,
          createdAt: parseDate(budget.fecha_creacion || budget.created_at),
          updatedAt: parseDate(budget.fecha_modificacion || budget.updated_at)
        }
      });
    }
    console.log(`✅ ${sqliteBudgets.length} presupuestos migrados\n`);

    // 9. Migrar Gastos
    console.log('📦 Migrando gastos...');
    const sqliteExpenses = await db.all('SELECT * FROM gastos');
    for (const expense of sqliteExpenses) {
      await prisma.expense.upsert({
        where: { id: expense.id },
        update: {},
        create: {
          id: expense.id,
          proyectoId: expense.proyecto_id,
          categoria: expense.categoria || 'general',
          descripcion: expense.descripcion || null,
          monto: expense.monto ? parseFloat(expense.monto) : 0,
          fecha: parseDate(expense.fecha),
          responsable: expense.responsable || null,
          estado: expense.estado || 'aprobado',
          comprobante: expense.comprobante || null,
          usuarioId: expense.usuario_id || null,
          createdAt: parseDate(expense.fecha_creacion || expense.created_at)
        }
      });
    }
    console.log(`✅ ${sqliteExpenses.length} gastos migrados\n`);

    // 10. Migrar Tareas
    console.log('📦 Migrando tareas...');
    const sqliteTasks = await db.all('SELECT * FROM tareas');
    for (const task of sqliteTasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {},
        create: {
          id: task.id,
          proyectoId: task.proyecto_id,
          nombre: task.nombre,
          descripcion: task.descripcion || null,
          prioridad: task.prioridad || 'media',
          estado: task.estado || 'pendiente',
          fechaInicio: task.fecha_inicio ? parseDate(task.fecha_inicio) : null,
          fechaFin: task.fecha_fin ? parseDate(task.fecha_fin) : null,
          progreso: task.progreso || 0,
          createdAt: parseDate(task.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqliteTasks.length} tareas migradas\n`);

    // 11. Migrar Asignaciones de Tareas
    console.log('📦 Migrando asignaciones de tareas...');
    const sqliteAssignments = await db.all('SELECT * FROM asignaciones_tareas');
    for (const assignment of sqliteAssignments) {
      await prisma.taskAssignment.upsert({
        where: { id: assignment.id },
        update: {},
        create: {
          id: assignment.id,
          tareaId: assignment.tarea_id,
          usuarioId: assignment.usuario_id,
          rol: assignment.rol || 'ejecutor',
          createdAt: parseDate(assignment.fecha_asignacion)
        }
      });
    }
    console.log(`✅ ${sqliteAssignments.length} asignaciones migradas\n`);

    // 12. Migrar Proveedores
    console.log('📦 Migrando proveedores...');
    const sqliteProviders = await db.all('SELECT * FROM proveedores');
    for (const provider of sqliteProviders) {
      await prisma.provider.upsert({
        where: { id: provider.id },
        update: {},
        create: {
          id: provider.id,
          nombre: provider.nombre,
          nit: provider.nit || null,
          contacto: provider.contacto || null,
          telefono: provider.telefono || null,
          email: provider.email || null,
          direccion: provider.direccion || null,
          tipoProducto: provider.tipo_producto || null,
          calificacion: provider.calificacion ? parseFloat(provider.calificacion) : null,
          estado: provider.estado || 'activo',
          notas: provider.notas || null,
          createdAt: parseDate(provider.fecha_creacion),
          updatedAt: parseDate(provider.fecha_modificacion)
        }
      });
    }
    console.log(`✅ ${sqliteProviders.length} proveedores migrados\n`);

    // 13. Migrar Productos
    console.log('📦 Migrando productos...');
    const sqliteProducts = await db.all('SELECT * FROM productos');
    for (const product of sqliteProducts) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {},
        create: {
          id: product.id,
          nombre: product.nombre,
          tipo: product.tipo || 'insumo',
          categoria: product.categoria || null,
          unidad: product.unidad || 'unidad',
          stockActual: product.stock_actual || 0,
          stockMinimo: product.stock_minimo || 0,
          costoUnitario: product.costo_unitario ? parseFloat(product.costo_unitario) : 0,
          proveedorId: product.proveedor_id || null,
          descripcion: product.descripcion || null,
          esOrganico: product.es_organico === 1,
          estado: product.estado || 'activo',
          createdAt: parseDate(product.fecha_creacion),
          updatedAt: parseDate(product.fecha_modificacion)
        }
      });
    }
    console.log(`✅ ${sqliteProducts.length} productos migrados\n`);

    // 14. Migrar Movimientos de Inventario
    console.log('📦 Migrando movimientos de inventario...');
    const sqliteMovements = await db.all('SELECT * FROM movimientos_inventario');
    for (const movement of sqliteMovements) {
      await prisma.inventoryMovement.upsert({
        where: { id: movement.id },
        update: {},
        create: {
          id: movement.id,
          productoId: movement.producto_id,
          tipo: movement.tipo,
          cantidad: movement.cantidad || 0,
          costoUnitario: movement.costo_unitario ? parseFloat(movement.costo_unitario) : 0,
          costoTotal: movement.costo_total ? parseFloat(movement.costo_total) : 0,
          proyectoId: movement.proyecto_id || null,
          usuarioId: movement.usuario_id,
          fecha: parseDate(movement.fecha),
          descripcion: movement.descripcion || null,
          createdAt: parseDate(movement.fecha_creacion)
        }
      });
    }
    console.log(`✅ ${sqliteMovements.length} movimientos migrados\n`);

    console.log('='.repeat(50));
    console.log('✨ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR EN MIGRACIÓN:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  db.initialize()
    .then(() => migrateData())
    .then(() => {
      console.log('\n👋 Migración finalizada. Cerrando conexiones...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
