"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BotonConfirmar({
  reservaId,
  confirmada,
}: {
  reservaId: number;
  confirmada: boolean;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function confirmar() {
    setCargando(true);
    setError("");
    const res = await fetch(`/api/reservas/${reservaId}/confirmar`, {
      method: "POST",
    });
    setCargando(false);
    if (res.ok) {
      router.refresh();
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible confirmar la asistencia.");
    }
  }

  if (confirmada) {
    return null;
  }

  return (
    <>
      <button className="boton" onClick={confirmar} disabled={cargando}>
        {cargando ? "Confirmando..." : "Confirmar"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </>
  );
}
