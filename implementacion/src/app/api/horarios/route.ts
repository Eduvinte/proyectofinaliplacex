import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidadId = searchParams.get("especialidadId");
    const medicoId = searchParams.get("medicoId");
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json({ error: "Debe indicar una fecha." }, { status: 400 });
    }

    const inicio = new Date(`${fecha}T00:00:00Z`);
    const fin = new Date(`${fecha}T23:59:59Z`);

    const filtroMedico = medicoId
      ? { medicoId: Number(medicoId) }
      : especialidadId
        ? { medico: { especialidadId: Number(especialidadId) } }
        : {};

    const horarios = await prisma.horarioDisponible.findMany({
      where: {
        fecha: { gte: inicio, lte: fin },
        estado: "disponible",
        ...filtroMedico,
      },
      include: {
        medico: {
          include: { especialidad: true },
        },
      },
      orderBy: { horaInicio: "asc" },
    });

    const resultado = horarios.map((h) => ({
      id: h.id,
      fecha: h.fecha.toISOString().slice(0, 10),
      horaInicio: h.horaInicio.toISOString().slice(11, 16),
      horaFin: h.horaFin.toISOString().slice(11, 16),
      medico: `${h.medico.nombre} ${h.medico.apellido}`,
      especialidad: h.medico.especialidad.nombre,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en GET /api/horarios:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "medico") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { fecha, horaInicio, horaFin } = await request.json();
    if (!fecha || !horaInicio || !horaFin) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }
    if (horaInicio >= horaFin) {
      return NextResponse.json(
        { error: "La hora de inicio debe ser anterior a la hora de término." },
        { status: 400 }
      );
    }

    const medico = await prisma.medico.findUnique({
      where: { usuarioId: sesion.usuarioId },
    });
    if (!medico) {
      return NextResponse.json({ error: "Perfil de médico no encontrado." }, { status: 404 });
    }

    const fechaDate = new Date(`${fecha}T00:00:00Z`);
    const inicio = new Date(`1970-01-01T${horaInicio}:00Z`);
    const fin = new Date(`1970-01-01T${horaFin}:00Z`);

    if ([fechaDate, inicio, fin].some((valor) => Number.isNaN(valor.getTime()))) {
      return NextResponse.json({ error: "La fecha o el horario no es válido." }, { status: 400 });
    }
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    if (fechaDate < hoy) {
      return NextResponse.json({ error: "No se pueden crear bloques en una fecha pasada." }, { status: 400 });
    }

    const bloquesDelDia = await prisma.horarioDisponible.findMany({
      where: {
        medicoId: medico.id,
        fecha: fechaDate,
        estado: { not: "cancelado" },
      },
      select: { horaInicio: true, horaFin: true },
    });
    const bloqueSuperpuesto = bloquesDelDia.some(
      (bloque) =>
        bloque.horaInicio.getTime() < fin.getTime() &&
        bloque.horaFin.getTime() > inicio.getTime()
    );
    if (bloqueSuperpuesto) {
      return NextResponse.json(
        { error: "El horario se superpone con otro bloque existente." },
        { status: 409 }
      );
    }

    const bloque = await prisma.horarioDisponible.create({
      data: { medicoId: medico.id, fecha: fechaDate, horaInicio: inicio, horaFin: fin },
    });

    return NextResponse.json({ ok: true, id: bloque.id }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/horarios:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
