import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "saludvida_session";

export type SesionUsuario = {
  usuarioId: number;
  perfil: "paciente" | "medico";
  email: string;
};

function secretKey() {
  const secreto = process.env.JWT_SECRET;
  if (!secreto && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET es obligatorio en producción.");
  }
  return new TextEncoder().encode(secreto ?? "secreto-de-desarrollo-solo-para-pruebas");
}

export async function crearSesion(datos: SesionUsuario) {
  const token = await new SignJWT({ ...datos })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function obtenerSesion(): Promise<SesionUsuario | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.usuarioId !== "number" ||
      (payload.perfil !== "paciente" && payload.perfil !== "medico") ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      usuarioId: payload.usuarioId,
      perfil: payload.perfil,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
