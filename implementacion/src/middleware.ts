import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const RUTAS_PROTEGIDAS = ["/panel-paciente", "/panel-medico"];

function secretKey() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "secreto-de-desarrollo-solo-para-pruebas"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiereAuth = RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta));

  if (!requiereAuth) return NextResponse.next();

  const token = request.cookies.get("saludvida_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const perfil = payload.perfil as string;
    if (pathname.startsWith("/panel-paciente") && perfil !== "paciente") {
      return NextResponse.redirect(new URL("/panel-medico", request.url));
    }
    if (pathname.startsWith("/panel-medico") && perfil !== "medico") {
      return NextResponse.redirect(new URL("/panel-paciente", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/panel-paciente/:path*", "/panel-medico/:path*"],
};
