import { NextResponse } from "next/server";
import { cerrarSesion } from "@/lib/auth";

export async function GET(request: Request) {
  await cerrarSesion();
  const origen = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/login", origen));
}
