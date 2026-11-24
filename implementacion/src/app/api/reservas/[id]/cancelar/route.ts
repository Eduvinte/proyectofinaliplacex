import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "paciente") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const reserva = await prisma.reserva.findUnique({
      where: { id: Number(id) },
      include: { paciente: true },
    });
    if (!reserva) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    if (reserva.paciente.usuarioId !== sesion.usuarioId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
    if (reserva.estado === "cancelada" || reserva.estado === "atendida") {
      return NextResponse.json(
        { error: "La reserva no se puede cancelar en su estado actual." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.reserva.update({
        where: { id: reserva.id },
        data: { estado: "cancelada" },
      }),
      prisma.horarioDisponible.update({
        where: { id: reserva.horarioId },
        data: { estado: "disponible" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
