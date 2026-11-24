import Link from "next/link";
import BarraNavegacion from "@/components/barra-navegacion";
import Icono from "@/components/icono";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fechaTexto, horaTexto } from "@/lib/formato";
import BotonCancelar from "./boton-cancelar";

const ESTADOS_ACTIVOS = new Set(["pendiente", "confirmada"]);

export default async function PanelPaciente({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const paciente = await prisma.paciente.findUnique({
    where: { usuarioId: sesion.usuarioId },
    include: {
      reservas: {
        include: {
          horario: { include: { medico: { include: { especialidad: true } } } },
        },
      },
      atenciones: {
        include: { medico: true, recetas: true },
        orderBy: { fechaAtencion: "desc" },
      },
    },
  });

  if (!paciente) return null;

  const { vista = "proximas" } = await searchParams;
  const mostrarHistorial = vista === "historial";
  const activas = paciente.reservas
    .filter((reserva) => ESTADOS_ACTIVOS.has(reserva.estado))
    .sort((a, b) => {
      const fecha = a.horario.fecha.getTime() - b.horario.fecha.getTime();
      return fecha || a.horario.horaInicio.getTime() - b.horario.horaInicio.getTime();
    });
  const historicas = paciente.reservas
    .filter((reserva) => !ESTADOS_ACTIVOS.has(reserva.estado))
    .sort((a, b) => b.horario.fecha.getTime() - a.horario.fecha.getTime());
  const reservasMostradas = mostrarHistorial ? historicas : activas;
  const proxima = activas[0];

  return (
    <>
      <BarraNavegacion
        items={[
          { href: "/panel-paciente", etiqueta: "Mi panel", icono: "inicio", activo: true },
          { href: "/panel-paciente/reservar", etiqueta: "Reservar hora", icono: "calendario" },
        ]}
      />

      <main className="contenedor">
        <div className="encabezado-pagina">
          <div>
            <h1 className="titulo-pagina">Hola, {paciente.nombre}</h1>
            <p className="subtitulo-pagina">
              Aquí puedes revisar tus próximas horas y tu historial clínico.
            </p>
          </div>
          <Link className="boton boton-grande" href="/panel-paciente/reservar">
            <Icono nombre="calendario" />
            Reservar nueva hora
          </Link>
        </div>

        <section className="resumen-panel" aria-label="Resumen del paciente">
          <div className="resumen-item">
            <Icono nombre="calendario" />
            <div>
              <span>Próxima hora</span>
              <strong>{proxima ? `${fechaTexto(proxima.horario.fecha)} · ${horaTexto(proxima.horario.horaInicio)}` : "Sin reservas"}</strong>
            </div>
          </div>
          <div className="resumen-item">
            <Icono nombre="verificado" />
            <div><span>Reservas activas</span><strong>{activas.length}</strong></div>
          </div>
          <div className="resumen-item">
            <Icono nombre="historial" />
            <div><span>Atenciones registradas</span><strong>{paciente.atenciones.length}</strong></div>
          </div>
        </section>

        <div className="panel-layout">
          <section className="panel-seccion">
            <div className="panel-seccion-cabecera">
              <Icono nombre="agenda" />
              <h2>Mis reservas</h2>
            </div>
            <div className="panel-seccion-cuerpo">
              <div className="tabs" aria-label="Filtrar reservas">
                <Link className={!mostrarHistorial ? "tab activo" : "tab"} href="/panel-paciente">Próximas</Link>
                <Link className={mostrarHistorial ? "tab activo" : "tab"} href="/panel-paciente?vista=historial">Historial</Link>
              </div>
              {reservasMostradas.length ? (
                <div className="lista-agenda">
                  {reservasMostradas.map((reserva) => (
                    <article className="fila-agenda" key={reserva.id}>
                      <div>
                        <h3>{reserva.horario.medico.especialidad.nombre}</h3>
                        <p>
                          Dr(a). {reserva.horario.medico.nombre} {reserva.horario.medico.apellido}<br />
                          {fechaTexto(reserva.horario.fecha)} · {horaTexto(reserva.horario.horaInicio)} hrs
                          {reserva.motivo ? <> · {reserva.motivo}</> : null}
                        </p>
                      </div>
                      <div className="fila-acciones">
                        <span className={`estado estado-${reserva.estado}`}>
                          <Icono nombre="verificado" />
                          {reserva.estado}
                        </span>
                        {ESTADOS_ACTIVOS.has(reserva.estado) ? <BotonCancelar reservaId={reserva.id} /> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="estado-vacio">
                  <p>{mostrarHistorial ? "No tienes reservas anteriores." : "Aún no tienes horas próximas."}</p>
                  {!mostrarHistorial ? <Link href="/panel-paciente/reservar">Reservar una hora</Link> : null}
                </div>
              )}
            </div>
          </section>

          <aside className="panel-lateral">
            <div className="panel-lateral-cabecera">
              <Icono nombre="calendario" />
              <h2>Próxima hora</h2>
            </div>
            <div className="panel-lateral-cuerpo">
              {proxima ? (
                <div className="detalle-proximo">
                  <h3>{proxima.horario.medico.especialidad.nombre}</h3>
                  <p className="detalle-linea"><Icono nombre="paciente" /> Dr(a). {proxima.horario.medico.nombre} {proxima.horario.medico.apellido}</p>
                  <p className="detalle-linea"><Icono nombre="calendario" /> {fechaTexto(proxima.horario.fecha)} · {horaTexto(proxima.horario.horaInicio)}</p>
                  <span className={`estado estado-${proxima.estado}`}>{proxima.estado}</span>
                </div>
              ) : (
                <div className="estado-vacio">No hay una próxima hora programada.</div>
              )}
            </div>
          </aside>
        </div>

        <section className="tabla-contenedor seccion-secundaria" id="historial-clinico">
          <div className="tabla-cabecera">
            <Icono nombre="historial" />
            <h2 className="seccion-titulo">Historial clínico reciente</h2>
          </div>
          {paciente.atenciones.length ? (
            <table className="tabla-datos">
              <thead><tr><th>Fecha</th><th>Profesional</th><th>Diagnóstico</th><th>Receta</th></tr></thead>
              <tbody>
                {paciente.atenciones.slice(0, 5).map((atencion) => (
                  <tr key={atencion.id}>
                    <td>{atencion.fechaAtencion.toLocaleDateString("es-CL")}</td>
                    <td>Dr(a). {atencion.medico.nombre} {atencion.medico.apellido}</td>
                    <td>{atencion.diagnostico}</td>
                    <td>{atencion.recetas.length ? `${atencion.recetas.length} indicada(s)` : "Sin receta"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="estado-vacio">No tienes atenciones registradas todavía.</div>
          )}
        </section>
      </main>
    </>
  );
}
