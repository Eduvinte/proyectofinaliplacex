import Link from "next/link";
import BarraNavegacion from "@/components/barra-navegacion";
import Icono from "@/components/icono";
import { obtenerSesion } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Pacientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  const medico = await prisma.medico.findUnique({ where: { usuarioId: sesion.usuarioId } });
  if (!medico) return null;

  const { q = "" } = await searchParams;
  const busqueda = q.trim();
  const pacientes = await prisma.paciente.findMany({
    where: {
      AND: [
        {
          OR: [
            { reservas: { some: { horario: { medicoId: medico.id } } } },
            { atenciones: { some: { medicoId: medico.id } } },
          ],
        },
        busqueda
          ? {
              OR: [
                { nombre: { contains: busqueda } },
                { apellido: { contains: busqueda } },
                { rut: { contains: busqueda } },
              ],
            }
          : {},
      ],
    },
    include: { _count: { select: { atenciones: true, reservas: true } } },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });

  return (
    <>
      <BarraNavegacion
        items={[
          { href: "/panel-medico", etiqueta: "Mi agenda", icono: "agenda" },
          { href: "/panel-medico/disponibilidad", etiqueta: "Disponibilidad", icono: "calendario" },
          { href: "/panel-medico/pacientes", etiqueta: "Pacientes", icono: "pacientes", activo: true },
        ]}
      />
      <main className="contenedor">
        <div className="encabezado-pagina">
          <div>
            <h1 className="titulo-pagina">Mis pacientes</h1>
            <p className="subtitulo-pagina">Pacientes con reservas o atenciones vinculadas a tu agenda.</p>
          </div>
        </div>

        <form className="tarjeta" method="get" style={{ maxWidth: 680, margin: "0 0 1.5rem" }}>
          <div className="campo" style={{ marginBottom: "0.7rem" }}>
            <label htmlFor="q">Buscar por nombre, apellido o RUT</label>
            <input id="q" name="q" defaultValue={busqueda} placeholder="Ej.: Camila o 19.876..." />
          </div>
          <button className="boton" type="submit">Buscar paciente</button>
          {busqueda ? <Link className="boton boton-secundario" href="/panel-medico/pacientes" style={{ marginLeft: "0.6rem" }}>Limpiar</Link> : null}
        </form>

        {pacientes.length ? (
          <div className="panel-cards">
            {pacientes.map((paciente) => (
              <article className="panel-card" key={paciente.id}>
                <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
                  <Icono nombre="paciente" style={{ width: 30, color: "var(--turquesa-oscuro)" }} />
                  <div>
                    <h3>{paciente.nombre} {paciente.apellido}</h3>
                    <p style={{ color: "var(--gris-suave)", fontSize: "0.86rem" }}>{paciente.rut}</p>
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", marginTop: "0.8rem" }}>
                  Previsión: {paciente.prevision ?? "No informada"}<br />
                  Atenciones: {paciente._count.atenciones} · Reservas: {paciente._count.reservas}
                </p>
                <Link className="boton boton-secundario" href={`/panel-medico/pacientes/${paciente.id}`} style={{ marginTop: "0.8rem" }}>
                  Ver ficha clínica
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel-card estado-vacio">
            {busqueda ? "No hay pacientes que coincidan con la búsqueda." : "Aún no tienes pacientes vinculados."}
          </div>
        )}
      </main>
    </>
  );
}
