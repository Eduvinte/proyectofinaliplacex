import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, contrasena, perfil, nombre, apellido, rut } = body ?? {};

    if (!email || !contrasena || !perfil || !nombre || !apellido || !rut) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }
    if (contrasena.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (perfil !== "paciente" && perfil !== "medico") {
      return NextResponse.json({ error: "Perfil no válido." }, { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: "El correo ya se encuentra registrado." }, { status: 409 });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.$transaction(async (tx) => {
      const nuevo = await tx.usuario.create({
        data: { email, contrasenaHash: hash, perfil },
      });
      await tx.paciente.create({
        data: { usuarioId: nuevo.id, rut, nombre, apellido },
      });
      return nuevo;
    });

    return NextResponse.json({ ok: true, usuarioId: usuario.id }, { status: 201 });
  } catch (error) {
    console.error("Error en /api/registro:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
