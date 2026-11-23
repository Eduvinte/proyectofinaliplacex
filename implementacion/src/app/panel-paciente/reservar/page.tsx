"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Especialidad = { id: number; nombre: string };
type Medico = { id: number; nombre: string; especialidad: string };
type HorarioDisponible = {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  medico: string;
  especialidad: string;
};

export default function ReservarHora() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidadId, setEspecialidadId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [resultados, setResultados] = useState<HorarioDisponible[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [reservando, setReservando] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/especialidades")
      .then((res) => res.json())
      .then((datos) => setEspecialidades(datos))
      .catch(() => setError("No fue posible cargar las especialidades."));
  }, []);

  useEffect(() => {
    setMedicos([]);
    setMedicoId("");
    if (!especialidadId) return;
    fetch(`/api/medicos?especialidadId=${especialidadId}`)
      .then((res) => res.json())
      .then((datos) => setMedicos(datos))
      .catch(() => setError("No fue posible cargar los médicos."));
  }, [especialidadId]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setResultados([]);
    if (!especialidadId) {
      setError("Selecciona una especialidad.");
      return;
    }
    if (!medicoId) {
      setError("Selecciona un médico.");
      return;
    }
    if (!fecha) {
      setError("Selecciona una fecha para buscar disponibilidad.");
      return;
    }
    setBuscando(true);
    const res = await fetch(`/api/horarios?medicoId=${medicoId}&fecha=${fecha}`);
    setBuscando(false);
    if (res.ok) {
      setResultados(await res.json());
    } else {
      const datos = await res.json();
      setError(datos.error ?? "Error al buscar disponibilidad.");
    }
  }

  async function reservar(id: number) {
    setReservando(id);
    setMensaje("");
    setError("");
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horarioId: id, motivo: "Consulta médica" }),
    });
    setReservando(null);
    if (res.ok) {
      setMensaje("¡Hora reservada correctamente! Revisa tu panel de reservas.");
      setResultados([]);
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible reservar la hora.");
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

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
        <h1 style={{ color: "var(--azul)" }}>Reservar hora médica</h1>

        <form className="tarjeta" onSubmit={buscar} style={{ maxWidth: "560px" }}>
          <div className="campo">
            <label htmlFor="especialidad">1. Especialidad</label>
            <select
              id="especialidad"
              value={especialidadId}
              onChange={(e) => setEspecialidadId(e.target.value)}
            >
              <option value="">— Selecciona una especialidad —</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="medico">2. Médico</label>
            <select
              id="medico"
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
              disabled={!especialidadId}
            >
              <option value="">
                {especialidadId
                  ? "— Selecciona un médico —"
                  : "Primero elige una especialidad"}
              </option>
              {medicos.map((med) => (
                <option key={med.id} value={med.id}>
                  Dr(a). {med.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="fecha">3. Fecha</label>
            <input
              id="fecha"
              type="date"
              min={hoy}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <button
            className="boton"
            type="submit"
            disabled={buscando || !especialidadId || !medicoId}
            style={{ width: "100%" }}
          >
            {buscando ? "Buscando..." : "Buscar horas disponibles"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>

        {mensaje ? (
          <p className="exito" style={{ textAlign: "center", marginTop: "1rem" }}>
            {mensaje}
          </p>
        ) : null}

        {resultados.length ? (
          <section className="panel-cards" style={{ marginTop: "1.2rem" }}>
            {resultados.map((h) => (
              <div className="panel-card" key={h.id}>
                <h3>
                  {h.horaInicio} – {h.horaFin} hrs
                </h3>
                <p style={{ fontSize: "0.9rem" }}>
                  Dr(a). {h.medico}
                  <br />
                  {h.especialidad} · {h.fecha.split("-").reverse().join("-")}
                </p>
                <button
                  className="boton"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => reservar(h.id)}
                  disabled={reservando === h.id}
                >
                  {reservando === h.id ? "Reservando..." : "Reservar esta hora"}
                </button>
              </div>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
