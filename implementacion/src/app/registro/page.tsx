"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CabeceraPublica from "@/components/cabecera-publica";

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
    <>
      <CabeceraPublica />
      <main className="auth-shell">
        <section className="auth-contexto">
          <h1>Crea tu cuenta de paciente</h1>
          <p>
            Regístrate para reservar horas y consultar tu historial. Las cuentas
            médicas son creadas de forma interna por el centro.
          </p>
          <div className="auth-pasos" aria-label="Proceso de registro">
            <div className="auth-paso"><span>1</span> Completa tus datos personales</div>
            <div className="auth-paso"><span>2</span> Crea una contraseña segura</div>
            <div className="auth-paso"><span>3</span> Ingresa y reserva tu primera hora</div>
          </div>
        </section>
        <section className="auth-formulario">
          <form className="tarjeta" onSubmit={manejarEnvio}>
            <h2>Crear cuenta</h2>
            <p className="form-intro">Todos los campos son obligatorios.</p>
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" autoComplete="given-name" required maxLength={50} />
            </div>
            <div className="campo">
              <label htmlFor="apellido">Apellido</label>
              <input id="apellido" name="apellido" autoComplete="family-name" required maxLength={50} />
            </div>
            <div className="campo">
              <label htmlFor="rut">RUT</label>
              <input id="rut" name="rut" required maxLength={12} placeholder="12.345.678-5" />
              <p className="ayuda-campo">Incluye puntos y guion.</p>
            </div>
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={100} />
            </div>
            <div className="campo">
              <label htmlFor="contrasena">Contraseña</label>
              <input id="contrasena" name="contrasena" type="password" autoComplete="new-password" required minLength={8} />
              <p className="ayuda-campo">Usa al menos 8 caracteres.</p>
            </div>
            <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
              {cargando ? "Creando cuenta..." : "Crear mi cuenta"}
            </button>
            {error ? <p className="error" role="alert">{error}</p> : null}
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
