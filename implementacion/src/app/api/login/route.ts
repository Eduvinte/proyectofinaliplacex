import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { crearSesion } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, contrasena } = body ?? {};

    if (!email || !contrasena) {
      return NextResponse.json({ error: "Debe ingresar correo y contraseña." }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const valida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!valida) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    await crearSesion({
      usuarioId: usuario.id,
      perfil: usuario.perfil,
      email: usuario.email,
    });

    return NextResponse.json({ ok: true, perfil: usuario.perfil });
  } catch (error) {
    console.error("Error en /api/login:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
