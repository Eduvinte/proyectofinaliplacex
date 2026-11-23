import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenerSesion } from "@/lib/auth";

export async function DELETE(
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

    const horario = await prisma.horarioDisponible.findUnique({
      where: { id: Number(id) },
    });
    if (!horario || horario.medicoId !== medico.id) {
      return NextResponse.json({ error: "Bloque no encontrado." }, { status: 404 });
    }
    if (horario.estado !== "disponible") {
      return NextResponse.json(
        { error: "No se puede eliminar un bloque reservado." },
        { status: 409 }
      );
    }

    await prisma.horarioDisponible.delete({ where: { id: horario.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en DELETE /api/horarios:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
