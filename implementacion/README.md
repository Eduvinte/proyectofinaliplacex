# SaludVida — Plataforma web de reserva y gestión de horas médicas

Implementación del proyecto de título. Tecnologías: Next.js 15 (App Router,
TypeScript), Prisma ORM, MySQL 8, bcrypt para cifrado de contraseñas, JWT
(jose) para sesiones y CSS puro responsive (sin Bootstrap ni plantillas).

## Funcionalidades implementadas

- Registro e inicio de sesión con dos perfiles diferenciados (paciente y médico)
- Gestión de cuentas: validación de datos, contraseñas cifradas con bcrypt,
  sesiones JWT en cookies httpOnly y protección de rutas por perfil (middleware)
- Paciente: búsqueda de horas disponibles por especialidad y fecha, reserva,
  cancelación de reservas, panel con mis reservas e historial clínico (atenciones
  y recetas)
- Médico: agenda con confirmación de asistencia, registro de atención (diagnóstico,
  tratamiento y observaciones), emisión de recetas, gestión de bloques de
  disponibilidad y consulta del historial de los pacientes

## Requisitos

- Node.js 20 LTS
- Docker (para la base de datos MySQL local)

## Instalación

```bash
docker compose up -d          # levanta MySQL 8 en localhost:3306
npm install
cp .env.example .env          # editar DATABASE_URL y JWT_SECRET
npx prisma migrate dev        # crea el esquema (8 tablas, 3FN)
npm run db:seed               # carga datos de prueba
npm run dev
```

Abrir http://localhost:3000

## Cuentas de prueba (semilla)

- Médico: v.soto@saludvida.cl / saludvida123
- Paciente: camila.rojas@mail.com / saludvida123

## Estructura principal

```
prisma/
  schema.prisma          # Modelo de datos (8 tablas, 3FN)
  seed.ts                # Datos de prueba
src/
  app/
    page.tsx             # Página pública de inicio
    login/               # Formulario de inicio de sesión
    registro/            # Formulario de registro de usuario
    panel-paciente/      # Panel del paciente: reservas, historial, reservar hora
    panel-medico/        # Panel del médico: agenda, disponibilidad, atención, pacientes
    api/
      registro/          # API de registro (bcrypt + transacción)
      login/             # API de inicio de sesión (JWT)
      logout/            # Cierre de sesión
      horarios/          # GET disponibilidad por especialidad/fecha · POST crear bloque
      horarios/[id]/     # DELETE eliminar bloque
      reservas/          # POST reservar hora (transacción)
      reservas/[id]/cancelar/   # POST cancelar reserva
      reservas/[id]/confirmar/  # POST confirmar asistencia
      atenciones/        # POST registrar atención + receta
    globals.css          # Estilos CSS puros, diseño responsive
  lib/
    db.ts                # Singleton de PrismaClient
    auth.ts              # Creación y verificación de sesiones JWT
    formato.ts           # Utilidades de formato de fecha y hora
  middleware.ts          # Protección de rutas por perfil
```

## Base de datos

El script SQL equivalente (CREATE DATABASE, tablas, claves, índices y datos de
prueba) se encuentra en `../bd/saludvida.sql`.
