import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaludVida — Reserva de horas médicas",
  description:
    "Plataforma web de reserva y gestión de horas médicas del Centro Médico SaludVida.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
