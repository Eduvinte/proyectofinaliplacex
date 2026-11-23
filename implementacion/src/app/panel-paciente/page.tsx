import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fechaTexto, horaTexto } from "@/lib/formato";
import BotonCancelar from "./boton-cancelar";

export default async function PanelPaciente() {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const paciente = await prisma.paciente.findUnique({
    where: { usuarioId: sesion.usuarioId },
    include: {
      reservas: {
        include: {
          horario: { include: { medico: { include: { especialidad: true } } } },
        },
        orderBy: { fechaReserva: "desc" },
      },
      atenciones: {
        include: { medico: true, recetas: true },
        orderBy: { fechaAtencion: "desc" },
      },
    },
  });

  return (
    <>
      <header className="navbar">
        <Link className="logo" href="/">
          SaludVida
        </Link>
        <nav>
          <Link href="/panel-paciente">Mi panel</Link>
          <Link href="/panel-paciente/reservar">Reservar hora</Link>
          <Link href="/api/logout">Cerrar sesión</Link>
        </nav>
      </header>

      <main className="contenedor">
        <h1 style={{ color: "var(--azul)" }}>
          Hola, {paciente?.nombre ?? sesion.email}
        </h1>

        <section>
          <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.2rem 0 0.6rem" }}>
            Mis reservas
          </h2>
          {paciente?.reservas.length ? (
            <div className="panel-cards">
              {paciente.reservas.map((reserva) => (
                <div className="panel-card" key={reserva.id}>
                  <h3>
                    Dr(a). {reserva.horario.medico.nombre}{" "}
                    {reserva.horario.medico.apellido}
                  </h3>
                  <p style={{ fontSize: "0.9rem" }}>
                    {reserva.horario.medico.especialidad.nombre}
                    <br />
                    {fechaTexto(reserva.horario.fecha)} ·{" "}
                    {horaTexto(reserva.horario.horaInicio)} hrs
                    <br />
                    Estado: <strong>{reserva.estado}</strong>
                    {reserva.motivo ? (
                      <>
                        <br />
                        Motivo: {reserva.motivo}
                      </>
                    ) : null}
                  </p>
                  {reserva.estado === "pendiente" || reserva.estado === "confirmada" ? (
                    <BotonCancelar reservaId={reserva.id} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-card">
              <p style={{ fontSize: "0.9rem" }}>
                Aún no tienes horas reservadas.{" "}
                <Link href="/panel-paciente/reservar">Reserva tu primera hora aquí</Link>.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.4rem 0 0.6rem" }}>
            Historial clínico
          </h2>
          {paciente?.atenciones.length ? (
            <div className="panel-cards">
              {paciente.atenciones.map((atencion) => (
                <div className="panel-card" key={atencion.id}>
                  <h3>
                    Atención del {atencion.fechaAtencion.toLocaleDateString("es-CL")}
                  </h3>
                  <p style={{ fontSize: "0.9rem" }}>
                    Médico: Dr(a). {atencion.medico.nombre}{" "}
                    {atencion.medico.apellido}
                    <br />
                    Diagnóstico: {atencion.diagnostico}
                    {atencion.tratamiento ? (
                      <>
                        <br />
                        Tratamiento: {atencion.tratamiento}
                      </>
                    ) : null}
                  </p>
                  {atencion.recetas.length ? (
                    <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                      <strong>Recetas:</strong>
                      <br />
                      {atencion.recetas
                        .map(
                          (r) =>
                            `${r.medicamento} — ${r.dosis}, ${r.duracion}`
                        )
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-card">
              <p style={{ fontSize: "0.9rem" }}>
                No tienes atenciones registradas todavía.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
