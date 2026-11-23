-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `contrasena_hash` VARCHAR(255) NOT NULL,
    `perfil` ENUM('paciente', 'medico') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `especialidades_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicos` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER UNSIGNED NOT NULL,
    `especialidad_id` INTEGER UNSIGNED NOT NULL,
    `rut` VARCHAR(12) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `telefono` VARCHAR(15) NULL,

    UNIQUE INDEX `medicos_usuario_id_key`(`usuario_id`),
    UNIQUE INDEX `medicos_rut_key`(`rut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER UNSIGNED NOT NULL,
    `rut` VARCHAR(12) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `fecha_nacimiento` DATE NULL,
    `telefono` VARCHAR(15) NULL,
    `prevision` VARCHAR(30) NULL,

    UNIQUE INDEX `pacientes_usuario_id_key`(`usuario_id`),
    UNIQUE INDEX `pacientes_rut_key`(`rut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios_disponibles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `medico_id` INTEGER UNSIGNED NOT NULL,
    `fecha` DATE NOT NULL,
    `hora_inicio` TIME NOT NULL,
    `hora_fin` TIME NOT NULL,
    `estado` ENUM('disponible', 'reservado', 'cancelado') NOT NULL DEFAULT 'disponible',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `paciente_id` INTEGER UNSIGNED NOT NULL,
    `horario_id` INTEGER UNSIGNED NOT NULL,
    `estado` ENUM('pendiente', 'confirmada', 'cancelada', 'atendida') NOT NULL DEFAULT 'pendiente',
    `fecha_reserva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `motivo` VARCHAR(255) NULL,

    UNIQUE INDEX `reservas_horario_id_key`(`horario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atenciones` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `reserva_id` INTEGER UNSIGNED NOT NULL,
    `medico_id` INTEGER UNSIGNED NOT NULL,
    `paciente_id` INTEGER UNSIGNED NOT NULL,
    `diagnostico` TEXT NOT NULL,
    `tratamiento` TEXT NULL,
    `observaciones` VARCHAR(500) NULL,
    `fecha_atencion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `atenciones_reserva_id_key`(`reserva_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recetas` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `atencion_id` INTEGER UNSIGNED NOT NULL,
    `medicamento` VARCHAR(100) NOT NULL,
    `dosis` VARCHAR(100) NOT NULL,
    `duracion` VARCHAR(50) NOT NULL,
    `indicaciones` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicos` ADD CONSTRAINT `medicos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicos` ADD CONSTRAINT `medicos_especialidad_id_fkey` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios_disponibles` ADD CONSTRAINT `horarios_disponibles_medico_id_fkey` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_paciente_id_fkey` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_horario_id_fkey` FOREIGN KEY (`horario_id`) REFERENCES `horarios_disponibles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atenciones` ADD CONSTRAINT `atenciones_reserva_id_fkey` FOREIGN KEY (`reserva_id`) REFERENCES `reservas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atenciones` ADD CONSTRAINT `atenciones_medico_id_fkey` FOREIGN KEY (`medico_id`) REFERENCES `medicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atenciones` ADD CONSTRAINT `atenciones_paciente_id_fkey` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recetas` ADD CONSTRAINT `recetas_atencion_id_fkey` FOREIGN KEY (`atencion_id`) REFERENCES `atenciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
