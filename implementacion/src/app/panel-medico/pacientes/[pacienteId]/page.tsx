import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fechaTexto, horaTexto } from "@/lib/formato";

export default async function HistorialPaciente({
  params,
}: {
  params: Promise<{ pacienteId: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.perfil !== "medico") redirect("/login");

  const { pacienteId } = await params;

  const paciente = await prisma.paciente.findUnique({
    where: { id: Number(pacienteId) },
    include: {
      atenciones: {
        include: { medico: true, recetas: true },
        orderBy: { fechaAtencion: "desc" },
      },
      reservas: {
        include: { horario: true },
        orderBy: { fechaReserva: "desc" },
        take: 10,
      },
    },
  });

  if (!paciente) {
    return (
      <main className="contenedor">
        <div className="panel-card">
          <h3>Paciente no encontrado</h3>
          <Link className="boton" href="/panel-medico/pacientes" style={{ marginTop: "0.8rem" }}>
            Volver al listado
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
          <Link href="/panel-medico/pacientes">Pacientes</Link>
          <Link href="/api/logout">Cerrar sesión</Link>
        </nav>
      </header>

      <main className="contenedor">
        <h1 style={{ color: "var(--azul)" }}>
          Historial — {paciente.nombre} {paciente.apellido}
        </h1>
        <p style={{ marginTop: "0.4rem" }}>
          RUT: {paciente.rut} · Teléfono: {paciente.telefono ?? "—"}
        </p>

        <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.2rem 0 0.6rem" }}>
          Atenciones
        </h2>
        {paciente.atenciones.length ? (
          <div className="panel-cards">
            {paciente.atenciones.map((atencion) => (
              <div className="panel-card" key={atencion.id}>
                <h3>{atencion.fechaAtencion.toLocaleDateString("es-CL")}</h3>
                <p style={{ fontSize: "0.9rem" }}>
                  Médico: Dr(a). {atencion.medico.nombre} {atencion.medico.apellido}
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
                    {atencion.recetas.map((receta) => (
                      <span key={receta.id}>
                        <br />• {receta.medicamento} — {receta.dosis}, {receta.duracion}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p style={{ fontSize: "0.9rem" }}>
              Este paciente no tiene atenciones registradas.
            </p>
          </div>
        )}

        <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.2rem 0 0.6rem" }}>
          Últimas reservas
        </h2>
        {paciente.reservas.length ? (
          <div className="panel-cards">
            {paciente.reservas.map((reserva) => (
              <div className="panel-card" key={reserva.id}>
                <h3>
                  {fechaTexto(reserva.horario.fecha)} ·{" "}
                  {horaTexto(reserva.horario.horaInicio)} hrs
                </h3>
                <p style={{ fontSize: "0.9rem" }}>Estado: {reserva.estado}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p style={{ fontSize: "0.9rem" }}>Sin reservas registradas.</p>
          </div>
        )}
      </main>
    </>
  );
}
