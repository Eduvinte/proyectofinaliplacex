-- ============================================================================
-- Base de datos SaludVida
-- Plataforma web de reserva y gestión de horas médicas
-- SGBD: MySQL 8 — Modelo relacional normalizado en tercera forma normal (3FN)
-- Proyecto de Título — José Eduardo Rodrigues Godinho
-- ============================================================================

CREATE DATABASE IF NOT EXISTS saludvida
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE saludvida;

-- ----------------------------------------------------------------------------
-- Tabla 1: usuarios — credenciales de acceso y perfil de cada cuenta
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(100) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  perfil          ENUM('paciente','medico') NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 2: especialidades — catálogo de especialidades médicas
-- ----------------------------------------------------------------------------
CREATE TABLE especialidades (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(60) NOT NULL,
  descripcion VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_nombre (nombre)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 3: medicos — datos personales de los médicos
-- ----------------------------------------------------------------------------
CREATE TABLE medicos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  especialidad_id INT UNSIGNED NOT NULL,
  rut             VARCHAR(12) NOT NULL,
  nombre          VARCHAR(50) NOT NULL,
  apellido        VARCHAR(50) NOT NULL,
  telefono        VARCHAR(15) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_medicos_usuario (usuario_id),
  UNIQUE KEY uq_medicos_rut (rut),
  CONSTRAINT fk_medicos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_medicos_especialidad FOREIGN KEY (especialidad_id)
    REFERENCES especialidades (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  KEY idx_medicos_especialidad (especialidad_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 4: pacientes — datos personales de los pacientes
-- ----------------------------------------------------------------------------
CREATE TABLE pacientes (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id       INT UNSIGNED NOT NULL,
  rut              VARCHAR(12) NOT NULL,
  nombre           VARCHAR(50) NOT NULL,
  apellido         VARCHAR(50) NOT NULL,
  fecha_nacimiento DATE NULL,
  telefono         VARCHAR(15) NULL,
  prevision        VARCHAR(30) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pacientes_usuario (usuario_id),
  UNIQUE KEY uq_pacientes_rut (rut),
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 5: horarios_disponibles — bloques de atención ofrecidos por cada médico
-- ----------------------------------------------------------------------------
CREATE TABLE horarios_disponibles (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  medico_id   INT UNSIGNED NOT NULL,
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  estado      ENUM('disponible','reservado','cancelado') NOT NULL DEFAULT 'disponible',
  PRIMARY KEY (id),
  CONSTRAINT fk_horarios_medico FOREIGN KEY (medico_id)
    REFERENCES medicos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_horarios_fecha (fecha),
  KEY idx_horarios_medico (medico_id),
  CONSTRAINT chk_horarios_rango CHECK (hora_fin > hora_inicio)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 6: reservas — horas reservadas por los pacientes
-- ----------------------------------------------------------------------------
CREATE TABLE reservas (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id  INT UNSIGNED NOT NULL,
  horario_id   INT UNSIGNED NOT NULL,
  estado       ENUM('pendiente','confirmada','cancelada','atendida') NOT NULL DEFAULT 'pendiente',
  fecha_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo       VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservas_horario (horario_id),
  CONSTRAINT fk_reservas_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reservas_horario FOREIGN KEY (horario_id)
    REFERENCES horarios_disponibles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  KEY idx_reservas_paciente (paciente_id),
  KEY idx_reservas_estado (estado)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 7: atenciones — registro clínico de cada atención realizada
-- ----------------------------------------------------------------------------
CREATE TABLE atenciones (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id     INT UNSIGNED NOT NULL,
  medico_id      INT UNSIGNED NOT NULL,
  paciente_id    INT UNSIGNED NOT NULL,
  diagnostico    TEXT NOT NULL,
  tratamiento    TEXT NULL,
  observaciones  VARCHAR(500) NULL,
  fecha_atencion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_atenciones_reserva (reserva_id),
  CONSTRAINT fk_atenciones_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_atenciones_medico FOREIGN KEY (medico_id)
    REFERENCES medicos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_atenciones_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  KEY idx_atenciones_medico (medico_id),
  KEY idx_atenciones_paciente (paciente_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla 8: recetas — prescripciones médicas asociadas a una atención
-- ----------------------------------------------------------------------------
CREATE TABLE recetas (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  atencion_id  INT UNSIGNED NOT NULL,
  medicamento  VARCHAR(100) NOT NULL,
  dosis        VARCHAR(100) NOT NULL,
  duracion     VARCHAR(50) NOT NULL,
  indicaciones VARCHAR(500) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_recetas_atencion FOREIGN KEY (atencion_id)
    REFERENCES atenciones (id) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_recetas_atencion (atencion_id)
) ENGINE = InnoDB;

-- ============================================================================
-- Datos de prueba (seed)
-- ============================================================================

INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Medicina General', 'Atención primaria de salud del adulto'),
  ('Cardiología', 'Diagnóstico y tratamiento de enfermedades cardiovasculares'),
  ('Pediatría', 'Atención médica de niños y adolescentes');

INSERT INTO usuarios (email, contrasena_hash, perfil) VALUES
  ('v.soto@saludvida.cl', '$2a$10$EJN.exampleHashV00P0gL1aVY0bQ2aS3WqoG1oXkC7', 'medico'),
  ('p.reyes@saludvida.cl', '$2a$10$EJN.exampleHashV00P0gL1aVY0bQ2aS3WqoG1oXkC7', 'medico'),
  ('camila.rojas@mail.com', '$2a$10$EJN.exampleHashV00P0gL1aVY0bQ2aS3WqoG1oXkC7', 'paciente'),
  ('jorge.perez@mail.com', '$2a$10$EJN.exampleHashV00P0gL1aVY0bQ2aS3WqoG1oXkC7', 'paciente');

INSERT INTO medicos (usuario_id, especialidad_id, rut, nombre, apellido, telefono) VALUES
  (1, 1, '15.432.987-6', 'Valentina', 'Soto', '+56 9 5555 1001'),
  (2, 2, '12.876.543-2', 'Pablo', 'Reyes', '+56 9 5555 1002');

INSERT INTO pacientes (usuario_id, rut, nombre, apellido, fecha_nacimiento, telefono, prevision) VALUES
  (3, '19.876.543-K', 'Camila', 'Rojas', '1995-04-12', '+56 9 5555 2001', 'FONASA'),
  (4, '18.765.432-1', 'Jorge', 'Pérez', '1988-11-03', '+56 9 5555 2002', 'ISAPRE');

INSERT INTO horarios_disponibles (medico_id, fecha, hora_inicio, hora_fin, estado) VALUES
  (1, '2026-11-20', '09:00:00', '09:30:00', 'reservado'),
  (1, '2026-11-20', '09:30:00', '10:00:00', 'disponible'),
  (1, '2026-11-20', '10:00:00', '10:30:00', 'disponible'),
  (2, '2026-11-21', '11:00:00', '11:30:00', 'disponible');

INSERT INTO reservas (paciente_id, horario_id, estado, motivo) VALUES
  (1, 1, 'confirmada', 'Control de rutina');

INSERT INTO atenciones (reserva_id, medico_id, paciente_id, diagnostico, tratamiento) VALUES
  (1, 1, 1, 'Paciente en buen estado general.', 'Mantener hábitos saludables.');

INSERT INTO recetas (atencion_id, medicamento, dosis, duracion, indicaciones) VALUES
  (1, 'Paracetamol 500 mg', '1 comprimido', '5 días', 'Tomar cada 8 horas con alimentos.');
