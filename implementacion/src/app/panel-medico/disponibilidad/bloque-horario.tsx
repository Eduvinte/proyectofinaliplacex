"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Bloque = {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  paciente: string | null;
};

export default function BloqueHorario({ bloque }: { bloque: Bloque }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function eliminar() {
    if (!confirm("¿Seguro que deseas eliminar este bloque?")) return;
    setCargando(true);
    setError("");
    const res = await fetch(`/api/horarios/${bloque.id}`, { method: "DELETE" });
    setCargando(false);
    if (res.ok) {
      router.refresh();
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible eliminar el bloque.");
    }
  }

  return (
    <div className="panel-card">
      <h3>
        {bloque.fecha.split("-").reverse().join("-")} · {bloque.horaInicio} –{" "}
        {bloque.horaFin} hrs
      </h3>
      <p style={{ fontSize: "0.9rem" }}>
        Estado: <strong>{bloque.estado}</strong>
        {bloque.paciente ? (
          <>
            <br />
            Reservado por: {bloque.paciente}
          </>
        ) : null}
      </p>
      {bloque.estado === "disponible" ? (
        <button
          className="boton boton-secundario"
          style={{ marginTop: "0.5rem" }}
          onClick={eliminar}
          disabled={cargando}
        >
          {cargando ? "Eliminando..." : "Eliminar bloque"}
        </button>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
