"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormularioAtencion({ reservaId }: { reservaId: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/atenciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservaId,
        diagnostico: form.get("diagnostico"),
        tratamiento: form.get("tratamiento"),
        observaciones: form.get("observaciones"),
        medicamento: form.get("medicamento"),
        dosis: form.get("dosis"),
        duracion: form.get("duracion"),
        indicaciones: form.get("indicaciones"),
      }),
    });

    setCargando(false);
    if (res.ok) {
      router.push("/panel-medico?atencion=ok");
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible guardar la atención.");
    }
  }

  return (
    <form className="tarjeta" onSubmit={guardar} style={{ maxWidth: "640px" }}>
      <div className="campo">
        <label htmlFor="diagnostico">Diagnóstico *</label>
        <textarea id="diagnostico" name="diagnostico" rows={3} required />
      </div>
      <div className="campo">
        <label htmlFor="tratamiento">Tratamiento</label>
        <textarea id="tratamiento" name="tratamiento" rows={3} />
      </div>
      <div className="campo">
        <label htmlFor="observaciones">Observaciones</label>
        <input id="observaciones" name="observaciones" maxLength={500} />
      </div>

      <h3 style={{ color: "var(--azul)", fontSize: "1rem", margin: "0.4rem 0 0.6rem" }}>
        Receta médica (opcional)
      </h3>
      <div className="campo">
        <label htmlFor="medicamento">Medicamento</label>
        <input id="medicamento" name="medicamento" maxLength={100} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
        <div className="campo">
          <label htmlFor="dosis">Dosis</label>
          <input id="dosis" name="dosis" maxLength={100} />
        </div>
        <div className="campo">
          <label htmlFor="duracion">Duración</label>
          <input id="duracion" name="duracion" maxLength={50} />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="indicaciones">Indicaciones</label>
        <input id="indicaciones" name="indicaciones" maxLength={500} />
      </div>

      <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
        {cargando ? "Guardando..." : "Guardar atención"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
