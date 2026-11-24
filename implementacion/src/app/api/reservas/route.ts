import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function POST(request: Request) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "paciente") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { horarioId, motivo } = await request.json();
    if (!horarioId) {
      return NextResponse.json({ error: "Debe seleccionar un horario." }, { status: 400 });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: sesion.usuarioId },
    });
    if (!paciente) {
      return NextResponse.json({ error: "Perfil de paciente no encontrado." }, { status: 404 });
    }

    if (motivo != null && (typeof motivo !== "string" || motivo.trim().length > 255)) {
      return NextResponse.json({ error: "El motivo no puede superar 255 caracteres." }, { status: 400 });
    }

    const horario = await prisma.horarioDisponible.findUnique({
      where: { id: Number(horarioId) },
    });
    if (!horario || horario.estado !== "disponible") {
      return NextResponse.json(
        { error: "El horario ya no está disponible." },
        { status: 409 }
      );
    }

    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    if (horario.fecha < hoy) {
      return NextResponse.json({ error: "No se puede reservar un horario pasado." }, { status: 409 });
    }

    const reserva = await prisma.$transaction(async (tx) => {
      const actualizacion = await tx.horarioDisponible.updateMany({
        where: { id: horario.id, estado: "disponible" },
        data: { estado: "reservado" },
      });
      if (actualizacion.count !== 1) {
        throw new Error("HORARIO_NO_DISPONIBLE");
      }
      await tx.reserva.deleteMany({
        where: { horarioId: horario.id, estado: "cancelada" },
      });
      const nueva = await tx.reserva.create({
        data: {
          pacienteId: paciente.id,
          horarioId: horario.id,
          motivo: typeof motivo === "string" ? motivo.trim() || null : null,
        },
      });
      return nueva;
    });

    return NextResponse.json({ ok: true, reservaId: reserva.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "HORARIO_NO_DISPONIBLE") {
      return NextResponse.json({ error: "El horario ya no está disponible." }, { status: 409 });
    }
    console.error("Error en POST /api/reservas:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
