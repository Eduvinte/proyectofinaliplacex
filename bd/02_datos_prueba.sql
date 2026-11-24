-- SaludVida: datos sintéticos para demostración.
-- Contraseña de todas las cuentas: saludvida123
-- Hash bcrypt válido, factor de costo 10.

USE saludvida;

INSERT INTO especialidades (id, nombre, descripcion) VALUES
  (1, 'Medicina General', 'Atención primaria de salud del adulto'),
  (2, 'Cardiología', 'Diagnóstico y tratamiento de enfermedades cardiovasculares'),
  (3, 'Pediatría', 'Atención médica de niños y adolescentes');

INSERT INTO usuarios (id, email, contrasena_hash, perfil) VALUES
  (1, 'v.soto@saludvida.cl', '$2a$10$lwju6zBNOUEyHx4/9iok4OT4BR1gK2U8AQWOS1ddnE8535BRq8PQS', 'medico'),
  (2, 'p.reyes@saludvida.cl', '$2a$10$lwju6zBNOUEyHx4/9iok4OT4BR1gK2U8AQWOS1ddnE8535BRq8PQS', 'medico'),
  (3, 'camila.rojas@mail.com', '$2a$10$lwju6zBNOUEyHx4/9iok4OT4BR1gK2U8AQWOS1ddnE8535BRq8PQS', 'paciente'),
  (4, 'jorge.perez@mail.com', '$2a$10$lwju6zBNOUEyHx4/9iok4OT4BR1gK2U8AQWOS1ddnE8535BRq8PQS', 'paciente');

INSERT INTO medicos (id, usuario_id, especialidad_id, rut, nombre, apellido, telefono) VALUES
  (1, 1, 1, '15.432.987-6', 'Valentina', 'Soto', '+56 9 5555 1001'),
  (2, 2, 2, '12.876.543-2', 'Pablo', 'Reyes', '+56 9 5555 1002');

INSERT INTO pacientes (id, usuario_id, rut, nombre, apellido, fecha_nacimiento, telefono, prevision) VALUES
  (1, 3, '19.876.543-K', 'Camila', 'Rojas', '1995-04-12', '+56 9 5555 2001', 'FONASA'),
  (2, 4, '18.765.432-1', 'Jorge', 'Pérez', '1988-11-03', '+56 9 5555 2002', 'ISAPRE');

INSERT INTO horarios_disponibles (id, medico_id, fecha, hora_inicio, hora_fin, estado) VALUES
  (1, 1, '2026-11-23', '09:00:00', '09:30:00', 'reservado'),
  (2, 1, '2026-11-25', '09:00:00', '09:30:00', 'reservado'),
  (3, 1, '2026-11-25', '09:30:00', '10:00:00', 'disponible'),
  (4, 1, '2026-11-25', '10:00:00', '10:30:00', 'disponible'),
  (5, 1, '2026-11-26', '15:00:00', '15:30:00', 'disponible'),
  (6, 2, '2026-11-27', '11:00:00', '11:30:00', 'disponible');

INSERT INTO reservas (id, paciente_id, horario_id, estado, fecha_reserva, motivo) VALUES
  (1, 1, 1, 'atendida', '2026-11-22 18:30:00', 'Síntomas respiratorios'),
  (2, 1, 2, 'confirmada', '2026-11-23 10:15:00', 'Control de rutina');

INSERT INTO atenciones (id, reserva_id, medico_id, paciente_id, diagnostico, tratamiento, fecha_atencion) VALUES
  (1, 1, 1, 1, 'Resfrío común.', 'Reposo, hidratación y manejo sintomático.', '2026-11-23 09:20:00');

INSERT INTO recetas (atencion_id, medicamento, dosis, duracion, indicaciones) VALUES
  (1, 'Paracetamol 500 mg', '1 comprimido cada 8 horas', '3 días', 'Tomar con alimentos si existe malestar gástrico.');
