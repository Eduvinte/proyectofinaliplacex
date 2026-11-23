"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BotonCancelar({ reservaId }: { reservaId: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cancelar() {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    setCargando(true);
    setError("");
    const res = await fetch(`/api/reservas/${reservaId}/cancelar`, {
      method: "POST",
    });
    setCargando(false);
    if (res.ok) {
      router.refresh();
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible cancelar la reserva.");
    }
  }

  return (
    <>
      <button
        className="boton boton-secundario"
        style={{ marginTop: "0.6rem" }}
        onClick={cancelar}
        disabled={cargando}
      >
        {cargando ? "Cancelando..." : "Cancelar reserva"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </>
  );
}
