import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const especialidades = await prisma.especialidad.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(
      especialidades.map((e) => ({ id: e.id, nombre: e.nombre }))
    );
  } catch (error) {
    console.error("Error en GET /api/especialidades:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
