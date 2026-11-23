import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Pacientes() {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const pacientes = await prisma.paciente.findMany({
    include: {
      _count: { select: { atenciones: true, reservas: true } },
    },
    orderBy: { apellido: "asc" },
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
        <h1 style={{ color: "var(--azul)" }}>Pacientes del centro</h1>

        {pacientes.length ? (
          <div className="panel-cards">
            {pacientes.map((paciente) => (
              <div className="panel-card" key={paciente.id}>
                <h3>
                  {paciente.nombre} {paciente.apellido}
                </h3>
                <p style={{ fontSize: "0.9rem" }}>
                  RUT: {paciente.rut}
                  {paciente.prevision ? (
                    <>
                      <br />
                      Previsión: {paciente.prevision}
                    </>
                  ) : null}
                  <br />
                  Atenciones: {paciente._count.atenciones} · Reservas:{" "}
                  {paciente._count.reservas}
                </p>
                <Link
                  className="boton boton-secundario"
                  href={`/panel-medico/pacientes/${paciente.id}`}
                  style={{ marginTop: "0.5rem" }}
                >
                  Ver historial
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p style={{ fontSize: "0.9rem" }}>Aún no hay pacientes registrados.</p>
          </div>
        )}
      </main>
    </>
  );
}
