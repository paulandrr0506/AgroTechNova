-- DropForeignKey
ALTER TABLE `gastos` DROP FOREIGN KEY `gastos_usuario_id_fkey`;

-- DropIndex
DROP INDEX `gastos_usuario_id_fkey` ON `gastos`;

-- AlterTable
ALTER TABLE `gastos` MODIFY `descripcion` TEXT NULL,
    MODIFY `responsable` VARCHAR(100) NULL,
    MODIFY `usuario_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
