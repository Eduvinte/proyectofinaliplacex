"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormularioDisponibilidad() {
  const router = useRouter();
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("09:30");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().slice(0, 10);

  async function crearBloque(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);
    const res = await fetch("/api/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, horaInicio, horaFin }),
    });
    setCargando(false);
    if (res.ok) {
      setMensaje("Bloque creado correctamente.");
      setHoraFin("09:30");
      router.refresh();
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible crear el bloque.");
    }
  }

  return (
    <form className="tarjeta" onSubmit={crearBloque} style={{ maxWidth: "560px" }}>
      <h2 style={{ color: "var(--azul)", marginBottom: "0.8rem" }}>
        Crear bloque horario
      </h2>
      <div className="campo">
        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>
      <div className="campo">
        <label htmlFor="inicio">Hora de inicio</label>
        <input
          id="inicio"
          type="time"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          required
        />
      </div>
      <div className="campo">
        <label htmlFor="fin">Hora de término</label>
        <input
          id="fin"
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
          required
        />
      </div>
      <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
        {cargando ? "Creando..." : "Crear bloque"}
      </button>
      {mensaje ? <p className="exito">{mensaje}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
