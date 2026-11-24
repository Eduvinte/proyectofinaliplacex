import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

function rutValido(rut: string) {
  const limpio = rut.replace(/\.|-/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const digito = limpio.slice(-1);
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resultado = 11 - (suma % 11);
  const esperado = resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);
  return digito === esperado;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, contrasena, nombre, apellido, rut } = body ?? {};

    if (![email, contrasena, nombre, apellido, rut].every((valor) => typeof valor === "string" && valor.trim())) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }
    if (contrasena.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (!rutValido(rut)) {
      return NextResponse.json({ error: "El RUT ingresado no es válido." }, { status: 400 });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const rutNormalizado = rut.trim().toUpperCase();

    const existe = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
    if (existe) {
      return NextResponse.json({ error: "El correo ya se encuentra registrado." }, { status: 409 });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.$transaction(async (tx) => {
      const nuevo = await tx.usuario.create({
        data: { email: emailNormalizado, contrasenaHash: hash, perfil: "paciente" },
      });
      await tx.paciente.create({
        data: {
          usuarioId: nuevo.id,
          rut: rutNormalizado,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        },
      });
      return nuevo;
    });

    return NextResponse.json({ ok: true, usuarioId: usuario.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "El correo o RUT ya se encuentra registrado." },
        { status: 409 }
      );
    }
    console.error("Error en /api/registro:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
