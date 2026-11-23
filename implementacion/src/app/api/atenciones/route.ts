import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function POST(request: Request) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "medico") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      reservaId,
      diagnostico,
      tratamiento,
      observaciones,
      medicamento,
      dosis,
      duracion,
      indicaciones,
    } = body ?? {};

    if (!reservaId || !diagnostico) {
      return NextResponse.json(
        { error: "Debe indicar la reserva y el diagnóstico." },
        { status: 400 }
      );
    }

    const medico = await prisma.medico.findUnique({
      where: { usuarioId: sesion.usuarioId },
    });
    if (!medico) {
      return NextResponse.json({ error: "Perfil de médico no encontrado." }, { status: 404 });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: Number(reservaId) },
      include: { horario: true },
    });
    if (!reserva || reserva.horario.medicoId !== medico.id) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    if (reserva.estado === "cancelada" || reserva.estado === "atendida") {
      return NextResponse.json(
        { error: "La reserva ya fue cancelada o atendida." },
        { status: 409 }
      );
    }

    const conReceta = Boolean(medicamento && dosis && duracion);

    const atencion = await prisma.$transaction(async (tx) => {
      const nueva = await tx.atencion.create({
        data: {
          reservaId: reserva.id,
          medicoId: medico.id,
          pacienteId: reserva.pacienteId,
          diagnostico,
          tratamiento: tratamiento ?? null,
          observaciones: observaciones ?? null,
        },
      });
      await tx.reserva.update({
        where: { id: reserva.id },
        data: { estado: "atendida" },
      });
      if (conReceta) {
        await tx.receta.create({
          data: {
            atencionId: nueva.id,
            medicamento,
            dosis,
            duracion,
            indicaciones: indicaciones ?? null,
          },
        });
      }
      return nueva;
    });

    return NextResponse.json({ ok: true, atencionId: atencion.id }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/atenciones:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
