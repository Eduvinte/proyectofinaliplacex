import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("saludvida123", 10);

  await prisma.especialidad.createMany({
    data: [
      { nombre: "Medicina General", descripcion: "Atención primaria de salud del adulto" },
      { nombre: "Cardiología", descripcion: "Diagnóstico y tratamiento de enfermedades cardiovasculares" },
      { nombre: "Pediatría", descripcion: "Atención médica de niños y adolescentes" },
    ],
    skipDuplicates: true,
  });

  await prisma.usuario.createMany({
    data: [
      { email: "v.soto@saludvida.cl", contrasenaHash: hash, perfil: "medico" },
      { email: "p.reyes@saludvida.cl", contrasenaHash: hash, perfil: "medico" },
      { email: "camila.rojas@mail.com", contrasenaHash: hash, perfil: "paciente" },
      { email: "jorge.perez@mail.com", contrasenaHash: hash, perfil: "paciente" },
    ],
    skipDuplicates: true,
  });

  const medGral = await prisma.especialidad.findUniqueOrThrow({
    where: { nombre: "Medicina General" },
  });
  const cardio = await prisma.especialidad.findUniqueOrThrow({
    where: { nombre: "Cardiología" },
  });
  const uSoto = await prisma.usuario.findUniqueOrThrow({
    where: { email: "v.soto@saludvida.cl" },
  });
  const uReyes = await prisma.usuario.findUniqueOrThrow({
    where: { email: "p.reyes@saludvida.cl" },
  });
  const uCamila = await prisma.usuario.findUniqueOrThrow({
    where: { email: "camila.rojas@mail.com" },
  });

  const soto = await prisma.medico.create({
    data: {
      usuarioId: uSoto.id,
      especialidadId: medGral.id,
      rut: "15.432.987-6",
      nombre: "Valentina",
      apellido: "Soto",
      telefono: "+56 9 5555 1001",
    },
  });

  const reyes = await prisma.medico.create({
    data: {
      usuarioId: uReyes.id,
      especialidadId: cardio.id,
      rut: "12.876.543-2",
      nombre: "Pablo",
      apellido: "Reyes",
      telefono: "+56 9 5555 1002",
    },
  });

  const camila = await prisma.paciente.create({
    data: {
      usuarioId: uCamila.id,
      rut: "19.876.543-K",
      nombre: "Camila",
      apellido: "Rojas",
      fechaNacimiento: new Date("1995-04-12"),
      telefono: "+56 9 5555 2001",
      prevision: "FONASA",
    },
  });

  const horario = await prisma.horarioDisponible.create({
    data: {
      medicoId: soto.id,
      fecha: new Date("2026-11-25T00:00:00Z"),
      horaInicio: new Date("1970-01-01T09:00:00Z"),
      horaFin: new Date("1970-01-01T09:30:00Z"),
      estado: "reservado",
    },
  });

  await prisma.horarioDisponible.createMany({
    data: [
      {
        medicoId: soto.id,
        fecha: new Date("2026-11-25T00:00:00Z"),
        horaInicio: new Date("1970-01-01T09:30:00Z"),
        horaFin: new Date("1970-01-01T10:00:00Z"),
      },
      {
        medicoId: soto.id,
        fecha: new Date("2026-11-25T00:00:00Z"),
        horaInicio: new Date("1970-01-01T10:00:00Z"),
        horaFin: new Date("1970-01-01T10:30:00Z"),
      },
      {
        medicoId: soto.id,
        fecha: new Date("2026-11-26T00:00:00Z"),
        horaInicio: new Date("1970-01-01T15:00:00Z"),
        horaFin: new Date("1970-01-01T15:30:00Z"),
      },
      {
        medicoId: reyes.id,
        fecha: new Date("2026-11-27T00:00:00Z"),
        horaInicio: new Date("1970-01-01T11:00:00Z"),
        horaFin: new Date("1970-01-01T11:30:00Z"),
      },
    ],
  });

  const reserva = await prisma.reserva.create({
    data: {
      pacienteId: camila.id,
      horarioId: horario.id,
      estado: "confirmada",
      motivo: "Control de rutina",
    },
  });

  await prisma.atencion.create({
    data: {
      reservaId: reserva.id,
      medicoId: soto.id,
      pacienteId: camila.id,
      diagnostico: "Paciente en buen estado general.",
      tratamiento: "Mantener hábitos saludables.",
    },
  });

  console.log("Datos de prueba cargados correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
