"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Registro() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        contrasena: form.get("contrasena"),
        perfil: form.get("perfil"),
        nombre: form.get("nombre"),
        apellido: form.get("apellido"),
        rut: form.get("rut"),
      }),
    });

    setCargando(false);
    if (res.ok) {
      router.push("/login?registro=ok");
    } else {
      const datos = await res.json();
      setError(datos.error ?? "No fue posible crear la cuenta.");
    }
  }

  return (
    <div className="contenedor">
      <form className="tarjeta" onSubmit={manejarEnvio}>
        <h2 style={{ color: "var(--azul)", marginBottom: "1rem", textAlign: "center" }}>
          Crear cuenta
        </h2>

        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" required maxLength={50} />
        </div>
        <div className="campo">
          <label htmlFor="apellido">Apellido</label>
          <input id="apellido" name="apellido" required maxLength={50} />
        </div>
        <div className="campo">
          <label htmlFor="rut">RUT</label>
          <input id="rut" name="rut" required maxLength={12} placeholder="12.345.678-9" />
        </div>
        <div className="campo">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required maxLength={100} />
        </div>
        <div className="campo">
          <label htmlFor="contrasena">Contraseña</label>
          <input id="contrasena" name="contrasena" type="password" required minLength={8} />
        </div>
        <div className="campo">
          <label htmlFor="perfil">Perfil de usuario</label>
          <select id="perfil" name="perfil" defaultValue="paciente">
            <option value="paciente">Paciente</option>
            <option value="medico">Médico</option>
          </select>
        </div>

        <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
          {cargando ? "Creando cuenta..." : "Registrarme"}
        </button>

        {error && <p className="error">{error}</p>}
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
