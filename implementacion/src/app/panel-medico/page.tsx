import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fechaTexto, horaTexto } from "@/lib/formato";
import BotonConfirmar from "./boton-confirmar";

export default async function PanelMedico() {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const medico = await prisma.medico.findUnique({
    where: { usuarioId: sesion.usuarioId },
    include: { especialidad: true },
  });
  if (!medico) return null;

  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);

  const reservas = await prisma.reserva.findMany({
    where: {
      horario: { medicoId: medico.id },
      estado: { in: ["pendiente", "confirmada"] },
    },
    include: {
      paciente: true,
      horario: true,
    },
    orderBy: [{ horario: { fecha: "asc" } }, { horario: { horaInicio: "asc" } }],
  });

  return (
    <>
      <header className="navbar">
        <Link className="logo" href="/">
          SaludVida
        </Link>
        <nav>
          <Link href="/panel-medico">Mi agenda</Link>
          <Link href="/panel-medico/disponibilidad">Disponibilidad</Link>
          <Link href="/panel-medico/pacientes">Pacientes</Link>
          <Link href="/api/logout">Cerrar sesión</Link>
        </nav>
      </header>

      <main className="contenedor">
        <h1 style={{ color: "var(--azul)" }}>
          Agenda — Dr(a). {medico.nombre} {medico.apellido}
        </h1>
        <p style={{ marginTop: "0.4rem" }}>Especialidad: {medico.especialidad.nombre}</p>

        <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.2rem 0 0.6rem" }}>
          Próximas reservas
        </h2>
        {reservas.length ? (
          <div className="panel-cards">
            {reservas.map((reserva) => (
              <div className="panel-card" key={reserva.id}>
                <h3>
                  {fechaTexto(reserva.horario.fecha)} ·{" "}
                  {horaTexto(reserva.horario.horaInicio)} hrs
                </h3>
                <p style={{ fontSize: "0.9rem" }}>
                  Paciente: {reserva.paciente.nombre} {reserva.paciente.apellido}
                  <br />
                  RUT: {reserva.paciente.rut}
                  <br />
                  Estado: <strong>{reserva.estado}</strong>
                  {reserva.motivo ? (
                    <>
                      <br />
                      Motivo: {reserva.motivo}
                    </>
                  ) : null}
                </p>
                <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <BotonConfirmar reservaId={reserva.id} confirmada={reserva.estado === "confirmada"} />
                  <Link className="boton boton-secundario" href={`/panel-medico/atencion/${reserva.id}`}>
                    Registrar atención
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p style={{ fontSize: "0.9rem" }}>
              No tienes reservas pendientes. Crea bloques de disponibilidad para
              que los pacientes puedan reservar.
            </p>
            <Link className="boton" href="/panel-medico/disponibilidad" style={{ marginTop: "0.6rem" }}>
              Gestionar disponibilidad
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
