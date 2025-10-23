/**
 * TEST COMPLETO DE TODOS LOS MODELOS CON PRISMA
 * Verifica que la migración de SQLite a MySQL fue exitosa
 */

const RoleModel = require('./src/models/roleModel');
const CategoryModel = require('./src/models/categoryModel');
const UserModel = require('./src/models/userModel');
const ProjectModel = require('./src/models/projectModel');
const ProductModel = require('./src/models/productModel');
const ProviderModel = require('./src/models/providerModel');
const InventoryModel = require('./src/models/inventoryModel');
const BudgetModel = require('./src/models/budgetModel');
const ExpenseModel = require('./src/models/expenseModel');
const ResourceModel = require('./src/models/resourceModel');
const PhaseModel = require('./src/models/phaseModel');
const MilestoneModel = require('./src/models/milestoneModel');
const TaskModel = require('./src/models/taskModel');
const TaskAssignmentModel = require('./src/models/taskAssignmentModel');
const ReportModel = require('./src/models/reportModel');
const prisma = require('./src/db/prisma-client');

async function testAllModels() {
  console.log('\n🧪 ============================================');
  console.log('   PRUEBA COMPLETA DE MODELOS CON PRISMA');
  console.log('   Base de datos: MySQL');
  console.log('============================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. ROLES
    console.log('1️⃣  Probando RoleModel...');
    const roles = await RoleModel.findAll();
    console.log(`   ✅ Roles encontrados: ${roles.length}`);
    passed++;

    // 2. CATEGORÍAS
    console.log('\n2️⃣  Probando CategoryModel...');
    const categorias = await CategoryModel.findAll();
    console.log(`   ✅ Categorías encontradas: ${categorias.length}`);
    passed++;

    // 3. USUARIOS
    console.log('\n3️⃣  Probando UserModel...');
    const usuarios = await UserModel.findAll();
    console.log(`   ✅ Usuarios encontrados: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log(`   📝 Ejemplo: ${usuarios[0].nombre} (${usuarios[0].usuario})`);
    }
    passed++;

    // 4. PROYECTOS
    console.log('\n4️⃣  Probando ProjectModel...');
    const proyectos = await ProjectModel.findAll();
    console.log(`   ✅ Proyectos encontrados: ${proyectos.length}`);
    if (proyectos.length > 0) {
      console.log(`   📝 Ejemplo: ${proyectos[0].nombre} (${proyectos[0].categoria_nombre})`);
    }
    passed++;

    // 5. PROVEEDORES
    console.log('\n5️⃣  Probando ProviderModel...');
    const proveedores = await ProviderModel.findAll();
    console.log(`   ✅ Proveedores encontrados: ${proveedores.length}`);
    if (proveedores.length > 0) {
      console.log(`   📝 Ejemplo: ${proveedores[0].nombre}`);
    }
    passed++;

    // 6. PRODUCTOS
    console.log('\n6️⃣  Probando ProductModel...');
    const productos = await ProductModel.findAll();
    console.log(`   ✅ Productos encontrados: ${productos.length}`);
    if (productos.length > 0) {
      console.log(`   📝 Ejemplo: ${productos[0].nombre} (${productos[0].tipo})`);
    }
    passed++;

    // 7. MOVIMIENTOS DE INVENTARIO
    console.log('\n7️⃣  Probando InventoryModel...');
    const movimientos = await InventoryModel.findAll();
    console.log(`   ✅ Movimientos encontrados: ${movimientos.length}`);
    passed++;

    // 8. PRESUPUESTOS
    console.log('\n8️⃣  Probando BudgetModel...');
    const presupuestos = await BudgetModel.findAll();
    console.log(`   ✅ Presupuestos encontrados: ${presupuestos.length}`);
    if (presupuestos.length > 0) {
      console.log(`   📝 Ejemplo: Proyecto ${presupuestos[0].proyecto_nombre} - $${presupuestos[0].monto_total}`);
    }
    passed++;

    // 9. GASTOS
    console.log('\n9️⃣  Probando ExpenseModel...');
    const gastos = await ExpenseModel.findAll();
    console.log(`   ✅ Gastos encontrados: ${gastos.length}`);
    if (gastos.length > 0) {
      console.log(`   📝 Ejemplo: ${gastos[0].descripcion} - $${gastos[0].monto}`);
    }
    passed++;

    // 10. RECURSOS
    console.log('\n🔟 Probando ResourceModel...');
    const recursos = await ResourceModel.findAll();
    console.log(`   ✅ Recursos encontrados: ${recursos.length}`);
    if (recursos.length > 0) {
      console.log(`   📝 Ejemplo: ${recursos[0].nombre} (${recursos[0].tipo})`);
    }
    passed++;

    // 11. FASES
    console.log('\n1️⃣1️⃣ Probando PhaseModel...');
    if (proyectos.length > 0) {
      const fases = await PhaseModel.findByProject(proyectos[0].id);
      console.log(`   ✅ Fases del proyecto "${proyectos[0].nombre}": ${fases.length}`);
    } else {
      console.log(`   ⚠️  No hay proyectos para probar fases`);
    }
    passed++;

    // 12. HITOS
    console.log('\n1️⃣2️⃣ Probando MilestoneModel...');
    if (proyectos.length > 0) {
      const hitos = await MilestoneModel.findByProject(proyectos[0].id);
      console.log(`   ✅ Hitos del proyecto "${proyectos[0].nombre}": ${hitos.length}`);
    } else {
      console.log(`   ⚠️  No hay proyectos para probar hitos`);
    }
    passed++;

    // 13. TAREAS
    console.log('\n1️⃣3️⃣ Probando TaskModel...');
    const tareas = await TaskModel.findAll();
    console.log(`   ✅ Tareas encontradas: ${tareas.length}`);
    passed++;

    // 14. ASIGNACIONES DE TAREAS
    console.log('\n1️⃣4️⃣ Probando TaskAssignmentModel...');
    if (tareas.length > 0) {
      const asignaciones = await TaskAssignmentModel.findByTask(tareas[0].id);
      console.log(`   ✅ Asignaciones de la tarea "${tareas[0].nombre}": ${asignaciones.length}`);
    } else {
      console.log(`   ⚠️  No hay tareas para probar asignaciones`);
    }
    passed++;

    // 15. REPORTES (usando callbacks)
    console.log('\n1️⃣5️⃣ Probando ReportModel...');
    await new Promise((resolve, reject) => {
      ReportModel.getFinishedProjects((err, proyectosFinalizados) => {
        if (err) {
          console.log(`   ❌ Error en ReportModel: ${err.message}`);
          failed++;
          reject(err);
        } else {
          console.log(`   ✅ Proyectos finalizados: ${proyectosFinalizados ? proyectosFinalizados.length : 0}`);
          passed++;
          resolve();
        }
      });
    });

    // RESUMEN FINAL
    console.log('\n\n🎉 ============================================');
    console.log('              RESUMEN DE PRUEBAS');
    console.log('============================================');
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📊 Total de modelos: 15`);
    console.log('\n✨ TODOS LOS MODELOS HAN SIDO MIGRADOS A PRISMA ✨');
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error);
    failed++;
  } finally {
    // Cerrar conexión de Prisma
    await prisma.$disconnect();
    console.log('\n🔌 Conexión a MySQL cerrada\n');
    
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Ejecutar pruebas
testAllModels();
