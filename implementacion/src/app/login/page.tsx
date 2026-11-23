"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        contrasena: form.get("contrasena"),
      }),
    });

    setCargando(false);
    if (res.ok) {
      const datos = await res.json();
      router.push(datos.perfil === "medico" ? "/panel-medico" : "/panel-paciente");
    } else {
      const datos = await res.json();
      setError(datos.error ?? "Credenciales inválidas.");
    }
  }

  return (
    <div className="contenedor">
      <form className="tarjeta" onSubmit={manejarEnvio}>
        <h2 style={{ color: "var(--azul)", marginBottom: "1rem", textAlign: "center" }}>
          Iniciar sesión
        </h2>
        {params.get("registro") === "ok" && (
          <p style={{ color: "#2e7d32", fontSize: "0.9rem", textAlign: "center", marginBottom: "0.8rem" }}>
            Cuenta creada correctamente. Ingresa tus credenciales.
          </p>
        )}
        <div className="campo">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="campo">
          <label htmlFor="contrasena">Contraseña</label>
          <input id="contrasena" name="contrasena" type="password" required />
        </div>
        <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
        {error && <p className="error">{error}</p>}
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          ¿No tienes cuenta? <Link href="/registro">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
