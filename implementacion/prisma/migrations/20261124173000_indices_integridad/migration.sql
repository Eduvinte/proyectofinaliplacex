CREATE INDEX `idx_medicos_especialidad` ON `medicos`(`especialidad_id`);
CREATE INDEX `idx_horarios_fecha` ON `horarios_disponibles`(`fecha`);
CREATE INDEX `idx_horarios_medico` ON `horarios_disponibles`(`medico_id`);
CREATE INDEX `idx_reservas_paciente` ON `reservas`(`paciente_id`);
CREATE INDEX `idx_reservas_estado` ON `reservas`(`estado`);
CREATE INDEX `idx_atenciones_medico` ON `atenciones`(`medico_id`);
CREATE INDEX `idx_atenciones_paciente` ON `atenciones`(`paciente_id`);
CREATE INDEX `idx_recetas_atencion` ON `recetas`(`atencion_id`);
ALTER TABLE `horarios_disponibles`
  ADD CONSTRAINT `chk_horarios_rango` CHECK (`hora_fin` > `hora_inicio`);
