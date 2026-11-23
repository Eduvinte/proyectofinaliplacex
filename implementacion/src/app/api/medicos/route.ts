import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidadId = searchParams.get("especialidadId");
    if (!especialidadId) {
      return NextResponse.json(
        { error: "Debe indicar la especialidad." },
        { status: 400 }
      );
    }

    const medicos = await prisma.medico.findMany({
      where: { especialidadId: Number(especialidadId) },
      include: { especialidad: true },
      orderBy: { apellido: "asc" },
    });

    return NextResponse.json(
      medicos.map((m) => ({
        id: m.id,
        nombre: `${m.nombre} ${m.apellido}`,
        especialidad: m.especialidad.nombre,
      }))
    );
  } catch (error) {
    console.error("Error en GET /api/medicos:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
