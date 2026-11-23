# SaludVida — Plataforma web de reserva y gestión de horas médicas

Proyecto de título — Ingeniería en Informática.
Solución web para el Centro Médico SaludVida que digitaliza la reserva de horas,
reduce el ausentismo y centraliza el historial clínico de los pacientes.

## Tecnologías

- **Frontend/Backend:** Next.js 15 (App Router) + TypeScript
- **Diseño:** CSS puro responsive (sin Bootstrap ni plantillas)
- **Base de datos:** MySQL 8, modelo relacional en tercera forma normal (8 tablas)
- **ORM:** Prisma
- **Seguridad:** contraseñas con bcrypt, sesiones JWT en cookies httpOnly,
  middleware de protección de rutas por perfil

## Estructura del repositorio

```
├── bd/
│   └── saludvida.sql          # Script SQL: creación de la BD, tablas, claves,
│                              # índices y datos de prueba
└── implementacion/            # Aplicación Next.js
    ├── prisma/
    │   ├── schema.prisma      # Modelo de datos (8 tablas, 3FN)
    │   └── seed.ts            # Datos de prueba
    ├── docker-compose.yml     # MySQL 8 local para desarrollo
    └── src/
        ├── app/               # Páginas y API routes
        ├── lib/               # Cliente Prisma, autenticación, utilidades
        ├── middleware.ts      # Protección de rutas por perfil
        └── app/globals.css    # CSS puro responsive
```

## Funcionalidades

- Registro e inicio de sesión con dos perfiles diferenciados (paciente y médico)
- **Paciente:** reservar hora por especialidad → médico → fecha, cancelar
  reservas, ver mis reservas e historial clínico (atenciones y recetas)
- **Médico:** agenda con confirmación de asistencia, registro de atención
  (diagnóstico, tratamiento y observaciones), emisión de recetas, gestión de
  bloques de disponibilidad y consulta del historial de los pacientes

## Ejecución local

Requisitos: Node.js 20 LTS y Docker.

```bash
cd implementacion
docker compose up -d          # levanta MySQL 8 en localhost:3306
npm install
cp .env.example .env          # editar DATABASE_URL y JWT_SECRET
npx prisma migrate dev        # crea el esquema
npm run db:seed               # carga datos de prueba
npm run dev
```

Abrir http://localhost:3000

## Cuentas de prueba (seed)

| Perfil   | Correo                  | Contraseña      |
|----------|-------------------------|-----------------|
| Médico   | v.soto@saludvida.cl     | saludvida123    |
| Paciente | camila.rojas@mail.com   | saludvida123    |

## Base de datos (8 tablas, 3FN)

usuarios, especialidades, medicos, pacientes, horarios_disponibles, reservas,
atenciones y recetas. El detalle del modelo, el diccionario de datos y la
normalización se documentan en los informes del proyecto.
