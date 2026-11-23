import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "medico") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const medico = await prisma.medico.findUnique({
      where: { usuarioId: sesion.usuarioId },
    });
    if (!medico) {
      return NextResponse.json({ error: "Perfil de médico no encontrado." }, { status: 404 });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id: Number(id) },
      include: { horario: true },
    });
    if (!reserva || reserva.horario.medicoId !== medico.id) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    if (reserva.estado === "cancelada" || reserva.estado === "atendida") {
      return NextResponse.json(
        { error: "La reserva no se puede confirmar en su estado actual." },
        { status: 409 }
      );
    }

    await prisma.reserva.update({
      where: { id: reserva.id },
      data: { estado: "confirmada" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
