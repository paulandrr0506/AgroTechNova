/**
 * SCRIPT DE ACTUALIZACIÓN MASIVA
 * Actualiza todos los modelos de SQLite a Prisma
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

// Mapeo de nombres de modelos a nombres de Prisma
const modelMapping = {
  'Role': 'role',
  'User': 'user',
  'ProjectCategory': 'projectCategory',
  'Project': 'project',
  'Phase': 'phase',
  'Milestone': 'milestone',
  'Resource': 'resource',
  'Budget': 'budget',
  'Expense': 'expense',
  'Task': 'task',
  'TaskAssignment': 'taskAssignment',
  'Provider': 'provider',
  'Product': 'product',
  'InventoryMovement': 'inventoryMovement'
};

console.log('🔄 Iniciando actualización de modelos a Prisma...\n');

// Lista de archivos de modelo
const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'README.md');

let updated = 0;
let skipped = 0;

for (const file of modelFiles) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Verificar si ya usa Prisma
  if (content.includes("require('../db/prisma-client')")) {
    console.log(`⏭️  ${file} - Ya usa Prisma (omitido)`);
    skipped++;
    continue;
  }
  
  // Verificar si usa database
  if (!content.includes("require('../db/database')")) {
    console.log(`⏭️  ${file} - No usa database (omitido)`);
    skipped++;
    continue;
  }
  
  // Reemplazar import
  content = content.replace(
    /const db = require\(['"]\.\.\/db\/database['"]\);?/g,
    "const prisma = require('../db/prisma-client');"
  );
  
  // Actualizar comentario de migración si existe
  content = content.replace(
    /\* MODELO DE (.*?) - AGROTECHNOVA\s+\*\s+\* ([\s\S]*?)\*\//,
    (match, p1, p2) => {
      if (!p2.includes('Migrado a Prisma')) {
        return `* MODELO DE ${p1} - AGROTECHNOVA\n * \n * Migrado a Prisma ORM con MySQL.\n * ${p2.trim()}\n */`;
      }
      return match;
    }
  );
  
  // Guardar cambios
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${file} - Actualizado`);
  updated++;
}

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Actualizados: ${updated}`);
console.log(`   ⏭️  Omitidos: ${skipped}`);
console.log(`   📁 Total: ${modelFiles.length}`);
console.log(`\n⚠️  NOTA: Los archivos han sido actualizados para usar Prisma.`);
console.log(`   Ahora debes actualizar manualmente las consultas SQL dentro de cada modelo.`);
console.log(`   Consulta el archivo CODIGO_MIGRATION_GUIDE.md para ver ejemplos.\n`);
