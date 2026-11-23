import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";

export default async function Inicio() {
  const sesion = await obtenerSesion();

  return (
    <>
      <header className="navbar">
        <Link className="logo" href="/">
          SaludVida
        </Link>
        <nav>
          {sesion ? (
            <>
              <Link
                href={sesion.perfil === "paciente" ? "/panel-paciente" : "/panel-medico"}
              >
                Mi panel
              </Link>
              <Link href="/api/logout">Cerrar sesión</Link>
            </>
          ) : (
            <>
              <Link href="/login">Iniciar sesión</Link>
              <Link href="/registro">Crear cuenta</Link>
            </>
          )}
        </nav>
      </header>

      <main className="contenedor">
        <section style={{ textAlign: "center", marginTop: "3rem" }}>
          <h1>Bienvenido al Centro Médico SaludVida</h1>
          <p style={{ marginTop: "0.8rem", maxWidth: 640, marginInline: "auto" }}>
            Reserva tu hora médica en línea, revisa tu historial clínico y recibe
            recordatorios de tus citas, desde cualquier dispositivo.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
            {sesion ? (
              <Link className="boton" href={sesion.perfil === "paciente" ? "/panel-paciente" : "/panel-medico"}>
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link className="boton" href="/registro">
                  Crear cuenta
                </Link>
                <Link className="boton" href="/login">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="panel-cards" style={{ marginTop: "3rem" }}>
          <div className="panel-card">
            <h3>Reserva en línea</h3>
            <p style={{ fontSize: "0.9rem" }}>
              Busca disponibilidad por especialidad y médico, y reserva en menos
              de cinco minutos.
            </p>
          </div>
          <div className="panel-card">
            <h3>Historial clínico digital</h3>
            <p style={{ fontSize: "0.9rem" }}>
              Tus atenciones y recetas quedan registradas en un único
              repositorio seguro.
            </p>
          </div>
          <div className="panel-card">
            <h3>Recordatorios de citas</h3>
            <p style={{ fontSize: "0.9rem" }}>
              Confirmación y recordatorio de cada hora reservada para reducir
              el ausentismo.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
