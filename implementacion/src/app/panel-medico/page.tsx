import Link from "next/link";
import BarraNavegacion from "@/components/barra-navegacion";
import Icono from "@/components/icono";
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

  const [reservas, bloques] = await Promise.all([
    prisma.reserva.findMany({
      where: {
        horario: { medicoId: medico.id, fecha: { gte: hoy } },
        estado: { in: ["pendiente", "confirmada"] },
      },
      include: { paciente: true, horario: true },
      orderBy: [{ horario: { fecha: "asc" } }, { horario: { horaInicio: "asc" } }],
      take: 10,
    }),
    prisma.horarioDisponible.findMany({
      where: { medicoId: medico.id, fecha: { gte: hoy }, estado: "disponible" },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
      take: 4,
    }),
  ]);

  const confirmadas = reservas.filter((reserva) => reserva.estado === "confirmada").length;
  const pendientes = reservas.filter((reserva) => reserva.estado === "pendiente").length;
  const pacientesRecientes = Array.from(
    new Map(reservas.map((reserva) => [reserva.paciente.id, reserva.paciente])).values()
  ).slice(0, 4);
  const fechaActual = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(new Date());

  return (
    <>
      <BarraNavegacion
        items={[
          { href: "/panel-medico", etiqueta: "Mi agenda", icono: "agenda", activo: true },
          { href: "/panel-medico/disponibilidad", etiqueta: "Disponibilidad", icono: "calendario" },
          { href: "/panel-medico/pacientes", etiqueta: "Pacientes", icono: "pacientes" },
        ]}
      />

      <main className="contenedor">
        <div className="encabezado-pagina">
          <div>
            <h1 className="titulo-pagina">Agenda — Dr(a). {medico.nombre} {medico.apellido}</h1>
            <p className="subtitulo-pagina">{medico.especialidad.nombre} · {fechaActual}</p>
          </div>
          <Link className="boton boton-grande" href="/panel-medico/disponibilidad">
            <Icono nombre="suma" />
            Crear disponibilidad
          </Link>
        </div>

        <section className="resumen-panel" aria-label="Resumen de agenda">
          <div className="resumen-item">
            <Icono nombre="calendario" />
            <div><span>Reservas próximas</span><strong>{reservas.length}</strong></div>
          </div>
          <div className="resumen-item">
            <Icono nombre="verificado" />
            <div><span>Confirmadas</span><strong>{confirmadas}</strong></div>
          </div>
          <div className="resumen-item">
            <Icono nombre="reloj" />
            <div><span>Pendientes</span><strong>{pendientes}</strong></div>
          </div>
        </section>

        <div className="panel-layout">
          <section>
            <div className="panel-seccion-cabecera" style={{ border: "1px solid var(--borde)", borderBottom: 0, borderRadius: "16px 16px 0 0", background: "white" }}>
              <Icono nombre="calendario" />
              <h2>Próximas reservas</h2>
            </div>
            {reservas.length ? (
              <div className="agenda-medico" style={{ borderRadius: "0 0 16px 16px" }}>
                <div className="agenda-medico-fila cabecera">
                  <span>Hora</span><span>Paciente</span><span>Motivo</span><span>Estado</span><span>Acciones</span>
                </div>
                {reservas.map((reserva) => (
                  <article className="agenda-medico-fila" key={reserva.id}>
                    <strong>{horaTexto(reserva.horario.horaInicio)}</strong>
                    <div>
                      <strong>{reserva.paciente.nombre} {reserva.paciente.apellido}</strong>
                      <div style={{ color: "var(--gris-suave)", fontSize: "0.78rem" }}>{fechaTexto(reserva.horario.fecha)}</div>
                    </div>
                    <span>{reserva.motivo ?? "Consulta médica"}</span>
                    <span className={`estado estado-${reserva.estado}`}>{reserva.estado}</span>
                    <div className="fila-acciones">
                      <BotonConfirmar reservaId={reserva.id} confirmada={reserva.estado === "confirmada"} />
                      <Link className="boton boton-secundario" href={`/panel-medico/pacientes/${reserva.paciente.id}`}>Ver ficha</Link>
                      <Link className="boton" href={`/panel-medico/atencion/${reserva.id}`}>
                        <Icono nombre="atencion" />
                        Registrar atención
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel-card" style={{ borderRadius: "0 0 16px 16px" }}>
                <div className="estado-vacio">No hay reservas próximas en tu agenda.</div>
              </div>
            )}
          </section>

          <aside className="panel-lateral">
            <div className="panel-lateral-cabecera">
              <Icono nombre="reloj" />
              <h2>Próximos bloques</h2>
            </div>
            <div className="panel-lateral-cuerpo">
              {bloques.length ? (
                <div className="bloques-hoy">
                  {bloques.map((bloque) => (
                    <div className="bloque-hoy" key={bloque.id}>
                      <div>
                        <strong>{horaTexto(bloque.horaInicio)}–{horaTexto(bloque.horaFin)}</strong>
                        <div>{fechaTexto(bloque.fecha)}</div>
                      </div>
                      <span>Disponible</span>
                    </div>
                  ))}
                  <Link className="boton boton-secundario" href="/panel-medico/disponibilidad">Gestionar bloques</Link>
                </div>
              ) : (
                <div className="estado-vacio">No hay bloques disponibles próximos.</div>
              )}
            </div>
          </aside>
        </div>

        {pacientesRecientes.length ? (
          <section className="pacientes-recientes">
            <h2>Pacientes próximos</h2>
            {pacientesRecientes.map((paciente) => (
              <Link className="paciente-rapido" href={`/panel-medico/pacientes/${paciente.id}`} key={paciente.id}>
                <span>{paciente.nombre} {paciente.apellido}</span>
                <Icono nombre="chevron" />
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
