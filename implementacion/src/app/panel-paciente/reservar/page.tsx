"use client";

import { useEffect, useState } from "react";
import BarraNavegacion from "@/components/barra-navegacion";
import Icono from "@/components/icono";

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
  const [motivo, setMotivo] = useState("");
  const [resultados, setResultados] = useState<HorarioDisponible[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
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
    setBusquedaRealizada(false);
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
      setBusquedaRealizada(true);
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
      body: JSON.stringify({ horarioId: id, motivo: motivo.trim() || "Consulta médica" }),
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
      <BarraNavegacion
        items={[
          { href: "/panel-paciente", etiqueta: "Mi panel", icono: "inicio" },
          { href: "/panel-paciente/reservar", etiqueta: "Reservar hora", icono: "calendario", activo: true },
        ]}
      />

      <main className="contenedor">
        <div className="encabezado-pagina">
          <div>
            <h1 className="titulo-pagina">Reservar hora médica</h1>
            <p className="subtitulo-pagina">Selecciona especialidad, profesional y fecha para consultar disponibilidad.</p>
          </div>
        </div>

        <form className="tarjeta" onSubmit={buscar} style={{ maxWidth: "680px" }}>
          <h2>Busca una hora disponible</h2>
          <p className="form-intro">Los resultados corresponden a bloques habilitados por cada profesional.</p>
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

          <div className="campo">
            <label htmlFor="motivo">4. Motivo de consulta</label>
            <input
              id="motivo"
              maxLength={255}
              placeholder="Ej.: control médico"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <p className="ayuda-campo">Este dato ayudará al profesional a preparar la atención.</p>
          </div>

          <button
            className="boton"
            type="submit"
            disabled={buscando || !especialidadId || !medicoId}
            style={{ width: "100%" }}
          >
            <Icono nombre="calendario" />
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
          <section className="panel-cards" style={{ marginTop: "1.5rem" }} aria-label="Horarios disponibles">
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
                  <Icono nombre="verificado" />
                  {reservando === h.id ? "Reservando..." : "Reservar esta hora"}
                </button>
              </div>
            ))}
          </section>
        ) : busquedaRealizada && !error ? (
          <div className="panel-card estado-vacio" style={{ maxWidth: 680, margin: "1.5rem auto" }}>
            No se encontraron bloques disponibles para la fecha seleccionada. Prueba con otro día.
          </div>
        ) : null}
      </main>
    </>
  );
}
