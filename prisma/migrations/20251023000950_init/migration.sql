-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NULL,
    `permisos` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'activo',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,
    `ultimo_acceso` DATETIME(3) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias_proyecto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categorias_proyecto_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyectos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `categoria_id` INTEGER NOT NULL,
    `responsable_id` INTEGER NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `presupuesto` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'planificacion',
    `prioridad` VARCHAR(20) NOT NULL DEFAULT 'media',
    `ubicacion` VARCHAR(200) NULL,
    `objetivos` TEXT NULL,
    `alcance` TEXT NULL,
    `riesgos` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    `orden` INTEGER NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hitos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `fase_id` INTEGER NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_limite` DATE NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    `progreso` INTEGER NOT NULL DEFAULT 0,
    `prioridad` VARCHAR(20) NOT NULL DEFAULT 'media',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recursos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `unidad` VARCHAR(50) NULL,
    `costo_unitario` DECIMAL(10, 2) NOT NULL,
    `costo_total` DECIMAL(10, 2) NOT NULL,
    `proveedor` VARCHAR(100) NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'disponible',
    `descripcion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presupuestos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `categoria` VARCHAR(100) NOT NULL,
    `monto_asignado` DECIMAL(10, 2) NOT NULL,
    `monto_gastado` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `monto_disponible` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `categoria` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATE NOT NULL,
    `responsable` VARCHAR(100) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'aprobado',
    `comprobante` VARCHAR(200) NULL,
    `usuario_id` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tareas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proyecto_id` INTEGER NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `prioridad` VARCHAR(20) NOT NULL DEFAULT 'media',
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    `fecha_inicio` DATE NULL,
    `fecha_fin` DATE NULL,
    `progreso` INTEGER NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asignaciones_tareas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarea_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `rol` VARCHAR(50) NULL,
    `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `asignaciones_tareas_tarea_id_usuario_id_key`(`tarea_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `nit` VARCHAR(50) NULL,
    `contacto` VARCHAR(100) NULL,
    `telefono` VARCHAR(50) NULL,
    `email` VARCHAR(100) NULL,
    `direccion` TEXT NULL,
    `tipo_producto` VARCHAR(100) NULL,
    `calificacion` DECIMAL(3, 2) NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'activo',
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `proveedores_nit_key`(`nit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `categoria` VARCHAR(100) NULL,
    `unidad` VARCHAR(50) NOT NULL,
    `stock_actual` INTEGER NOT NULL DEFAULT 0,
    `stock_minimo` INTEGER NOT NULL DEFAULT 0,
    `costo_unitario` DECIMAL(10, 2) NOT NULL,
    `proveedor_id` INTEGER NULL,
    `descripcion` TEXT NULL,
    `es_organico` BOOLEAN NOT NULL DEFAULT false,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'disponible',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_modificacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimientos_inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producto_id` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `costo_unitario` DECIMAL(10, 2) NOT NULL,
    `costo_total` DECIMAL(10, 2) NOT NULL,
    `proyecto_id` INTEGER NULL,
    `usuario_id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_responsable_id_fkey` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fases` ADD CONSTRAINT `fases_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hitos` ADD CONSTRAINT `hitos_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hitos` ADD CONSTRAINT `hitos_fase_id_fkey` FOREIGN KEY (`fase_id`) REFERENCES `fases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recursos` ADD CONSTRAINT `recursos_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presupuestos` ADD CONSTRAINT `presupuestos_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tareas` ADD CONSTRAINT `tareas_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_tareas` ADD CONSTRAINT `asignaciones_tareas_tarea_id_fkey` FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asignaciones_tareas` ADD CONSTRAINT `asignaciones_tareas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
