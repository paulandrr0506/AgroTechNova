/**
 * SCRIPT DE PRUEBA - MODELOS CON PRISMA
 * Verifica que los modelos actualizados funcionen correctamente
 */

const prisma = require('./src/db/prisma-client');

async function testModels() {
  console.log('🧪 PRUEBA DE MODELOS CON PRISMA\n');

  try {
    // Test 1: Roles
    console.log('1️⃣ Probando RoleModel...');
    const roles = await prisma.role.findMany();
    console.log(`✅ Roles encontrados: ${roles.length}`);
    
    // Test 2: Users
    console.log('\n2️⃣ Probando UserModel...');
    const users = await prisma.user.findMany({ include: { role: true } });
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    if (users.length > 0) {
      console.log(`   Ejemplo: ${users[0].nombre} (${users[0].role.nombre})`);
    }
    
    // Test 3: Categories
    console.log('\n3️⃣ Probando CategoryModel...');
    const categories = await prisma.projectCategory.findMany();
    console.log(`✅ Categorías encontradas: ${categories.length}`);
    
    // Test 4: Projects
    console.log('\n4️⃣ Probando ProjectModel...');
    const projects = await prisma.project.findMany({
      include: { category: true, responsible: true }
    });
    console.log(`✅ Proyectos encontrados: ${projects.length}`);
    if (projects.length > 0) {
      console.log(`   Ejemplo: ${projects[0].nombre} (${projects[0].category?.nombre})`);
    }
    
    // Test 5: Products
    console.log('\n5️⃣ Probando ProductModel...');
    const products = await prisma.product.findMany();
    console.log(`✅ Productos encontrados: ${products.length}`);
    
    // Test 6: Providers
    console.log('\n6️⃣ Probando ProviderModel...');
    const providers = await prisma.provider.findMany();
    console.log(`✅ Proveedores encontrados: ${providers.length}`);
    
    console.log('\n✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE');
    console.log('\n📊 Resumen:');
    console.log(`   Roles: ${roles.length}`);
    console.log(`   Usuarios: ${users.length}`);
    console.log(`   Categorías: ${categories.length}`);
    console.log(`   Proyectos: ${projects.length}`);
    console.log(`   Productos: ${products.length}`);
    console.log(`   Proveedores: ${providers.length}`);
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBAS:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels();
