import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FormularioDisponibilidad from "./formulario-disponibilidad";
import BloqueHorario from "./bloque-horario";

export default async function Disponibilidad() {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const medico = await prisma.medico.findUnique({
    where: { usuarioId: sesion.usuarioId },
  });
  if (!medico) return null;

  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);

  const bloques = await prisma.horarioDisponible.findMany({
    where: { medicoId: medico.id, fecha: { gte: hoy } },
    include: { reserva: { include: { paciente: true } } },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    take: 20,
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
        <h1 style={{ color: "var(--azul)" }}>Gestionar disponibilidad</h1>

        <FormularioDisponibilidad />

        <h2 style={{ fontSize: "1.15rem", color: "var(--azul)", margin: "1.4rem 0 0.6rem" }}>
          Bloques próximos
        </h2>
        {bloques.length ? (
          <div className="panel-cards">
            {bloques.map((bloque) => (
              <BloqueHorario
                key={bloque.id}
                bloque={{
                  id: bloque.id,
                  fecha: bloque.fecha.toISOString().slice(0, 10),
                  horaInicio: bloque.horaInicio.toISOString().slice(11, 16),
                  horaFin: bloque.horaFin.toISOString().slice(11, 16),
                  estado: bloque.estado,
                  paciente: bloque.reserva
                    ? `${bloque.reserva.paciente.nombre} ${bloque.reserva.paciente.apellido}`
                    : null,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p style={{ fontSize: "0.9rem" }}>
              No tienes bloques de disponibilidad para los próximos días.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
