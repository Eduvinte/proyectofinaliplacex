import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fechaTexto, horaTexto } from "@/lib/formato";
import FormularioAtencion from "./formulario-atencion";

export default async function RegistroAtencion({
  params,
}: {
  params: Promise<{ reservaId: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "medico") redirect("/login");

  const { reservaId } = await params;
  const medico = await prisma.medico.findUnique({
    where: { usuarioId: sesion.usuarioId },
  });
  if (!medico) redirect("/login");

  const reserva = await prisma.reserva.findUnique({
    where: { id: Number(reservaId) },
    include: {
      paciente: true,
      horario: { include: { medico: true } },
    },
  });

  if (!reserva || reserva.horario.medicoId !== medico.id) {
    return (
      <main className="contenedor">
        <div className="panel-card">
          <h3>Reserva no encontrada</h3>
          <p style={{ fontSize: "0.9rem" }}>
            Esta reserva no existe o no corresponde a tu agenda.
          </p>
          <Link className="boton" href="/panel-medico" style={{ marginTop: "0.8rem" }}>
            Volver a mi agenda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="navbar">
        <Link className="logo" href="/">
          SaludVida
        </Link>
        <nav>
          <Link href="/panel-medico">Mi agenda</Link>
          <Link href="/api/logout">Cerrar sesión</Link>
        </nav>
      </header>

      <main className="contenedor">
        <h1 style={{ color: "var(--azul)" }}>Registrar atención</h1>
        <p style={{ marginTop: "0.4rem" }}>
          Paciente: {reserva.paciente.nombre} {reserva.paciente.apellido} · RUT:{" "}
          {reserva.paciente.rut}
          <br />
          Hora: {fechaTexto(reserva.horario.fecha)} a las{" "}
          {horaTexto(reserva.horario.horaInicio)} hrs
        </p>
        <FormularioAtencion reservaId={reserva.id} />
      </main>
    </>
  );
}
