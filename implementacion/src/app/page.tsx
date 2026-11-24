import Link from "next/link";
import Icono from "@/components/icono";
import Marca from "@/components/marca";
import { obtenerSesion } from "@/lib/auth";

export default async function Inicio() {
  const sesion = await obtenerSesion();
  const rutaPanel = sesion?.perfil === "medico" ? "/panel-medico" : "/panel-paciente";
  const rutaReserva = sesion
    ? sesion.perfil === "paciente"
      ? "/panel-paciente/reservar"
      : "/panel-medico"
    : "/registro";

  return (
    <>
      <header className="barra-navegacion">
        <div className="barra-contenido">
          <Marca />
          <nav aria-label="Navegación principal">
            {sesion ? (
              <>
                <Link className="nav-link" href={rutaPanel}>Mi panel</Link>
                <Link className="nav-link cerrar-sesion" href="/api/logout">
                  <Icono nombre="cerrar" />
                  Cerrar sesión
                </Link>
              </>
            ) : (
              <>
                <Link className="nav-link" href="/login">Iniciar sesión</Link>
                <Link className="boton" href="/registro">Crear cuenta</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-inicio">
          <div className="hero-contenido">
            <div className="hero-copy">
              <h1>Tu salud, organizada en un solo lugar</h1>
              <p>
                Reserva horas médicas en línea y consulta tu historial clínico
                desde cualquier dispositivo.
              </p>
              <div className="hero-acciones">
                <Link className="boton boton-grande" href={rutaReserva}>
                  <Icono nombre="calendario" />
                  Reservar una hora
                </Link>
                <Link className="boton boton-secundario boton-grande" href={sesion ? rutaPanel : "/login"}>
                  {sesion ? "Ir a mi panel" : "Iniciar sesión"}
                </Link>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-circulo" />
              <div className="ventana-agenda">
                <div className="ventana-barra"><span /><span /><span /></div>
                <div className="ventana-cuerpo">
                  <div className="calendario-demo">
                    {Array.from({ length: 20 }, (_, i) => <span key={i} />)}
                  </div>
                  <div className="agenda-demo"><span /><span /><span /><span /></div>
                </div>
              </div>
              <div className="linea-progreso" />
            </div>
          </div>
        </section>

        <section className="beneficios" aria-label="Beneficios de SaludVida">
          <div className="beneficios-contenido">
            <article className="beneficio">
              <Icono nombre="calendario" />
              <div>
                <h2>Reserva en línea</h2>
                <p>Elige especialidad, profesional y fecha con disponibilidad real.</p>
              </div>
            </article>
            <article className="beneficio">
              <Icono nombre="historial" />
              <div>
                <h2>Historial clínico digital</h2>
                <p>Revisa tus atenciones, diagnósticos y recetas cuando lo necesites.</p>
              </div>
            </article>
            <article className="beneficio">
              <Icono nombre="seguridad" />
              <div>
                <h2>Gestión segura</h2>
                <p>Accede con tu cuenta personal y mantén el control de tus atenciones.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="cta-final">
          <div>
            <h2>Comienza a gestionar tu salud hoy</h2>
            <Link className="boton boton-grande" href={sesion ? rutaPanel : "/registro"}>
              {sesion ? "Ir a mi panel" : "Crear cuenta"}
            </Link>
          </div>
        </section>
      </main>
      <footer className="pie-pagina">SaludVida</footer>
    </>
  );
}
