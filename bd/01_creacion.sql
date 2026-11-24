-- SaludVida: creación de esquema relacional (MySQL 8)
-- Ejecutar primero este archivo y luego 02_datos_prueba.sql.

CREATE DATABASE IF NOT EXISTS saludvida
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE saludvida;

CREATE TABLE usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  perfil ENUM('paciente','medico') NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE especialidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  descripcion VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE medicos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  especialidad_id INT UNSIGNED NOT NULL,
  rut VARCHAR(12) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  telefono VARCHAR(15) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_medicos_usuario (usuario_id),
  UNIQUE KEY uq_medicos_rut (rut),
  KEY idx_medicos_especialidad (especialidad_id),
  CONSTRAINT fk_medicos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_medicos_especialidad FOREIGN KEY (especialidad_id)
    REFERENCES especialidades (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pacientes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  rut VARCHAR(12) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  fecha_nacimiento DATE NULL,
  telefono VARCHAR(15) NULL,
  prevision VARCHAR(30) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pacientes_usuario (usuario_id),
  UNIQUE KEY uq_pacientes_rut (rut),
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE horarios_disponibles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  medico_id INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado ENUM('disponible','reservado','cancelado') NOT NULL DEFAULT 'disponible',
  PRIMARY KEY (id),
  KEY idx_horarios_fecha (fecha),
  KEY idx_horarios_medico (medico_id),
  CONSTRAINT fk_horarios_medico FOREIGN KEY (medico_id)
    REFERENCES medicos (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_horarios_rango CHECK (hora_fin > hora_inicio)
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  paciente_id INT UNSIGNED NOT NULL,
  horario_id INT UNSIGNED NOT NULL,
  estado ENUM('pendiente','confirmada','cancelada','atendida') NOT NULL DEFAULT 'pendiente',
  fecha_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservas_horario (horario_id),
  KEY idx_reservas_paciente (paciente_id),
  KEY idx_reservas_estado (estado),
  CONSTRAINT fk_reservas_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reservas_horario FOREIGN KEY (horario_id)
    REFERENCES horarios_disponibles (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE atenciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id INT UNSIGNED NOT NULL,
  medico_id INT UNSIGNED NOT NULL,
  paciente_id INT UNSIGNED NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NULL,
  observaciones VARCHAR(500) NULL,
  fecha_atencion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_atenciones_reserva (reserva_id),
  KEY idx_atenciones_medico (medico_id),
  KEY idx_atenciones_paciente (paciente_id),
  CONSTRAINT fk_atenciones_reserva FOREIGN KEY (reserva_id)
    REFERENCES reservas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_atenciones_medico FOREIGN KEY (medico_id)
    REFERENCES medicos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_atenciones_paciente FOREIGN KEY (paciente_id)
    REFERENCES pacientes (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE recetas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  atencion_id INT UNSIGNED NOT NULL,
  medicamento VARCHAR(100) NOT NULL,
  dosis VARCHAR(100) NOT NULL,
  duracion VARCHAR(50) NOT NULL,
  indicaciones VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_recetas_atencion (atencion_id),
  CONSTRAINT fk_recetas_atencion FOREIGN KEY (atencion_id)
    REFERENCES atenciones (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
