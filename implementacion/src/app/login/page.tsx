"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CabeceraPublica from "@/components/cabecera-publica";

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
    <>
      <CabeceraPublica />
      <main className="auth-shell">
        <section className="auth-contexto">
          <h1>Tu información de salud, siempre disponible</h1>
          <p>
            Ingresa para reservar una hora, consultar tus atenciones o gestionar
            la agenda médica según tu perfil.
          </p>
          <div className="auth-pasos" aria-label="Funciones disponibles">
            <div className="auth-paso"><span>1</span> Reserva con disponibilidad real</div>
            <div className="auth-paso"><span>2</span> Revisa tus reservas e historial</div>
            <div className="auth-paso"><span>3</span> Accede desde cualquier dispositivo</div>
          </div>
        </section>
        <section className="auth-formulario">
          <form className="tarjeta" onSubmit={manejarEnvio}>
            <h2>Iniciar sesión</h2>
            <p className="form-intro">Ingresa el correo y la contraseña de tu cuenta.</p>
            {params.get("registro") === "ok" ? (
              <p className="exito">Cuenta creada correctamente. Ya puedes ingresar.</p>
            ) : null}
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="campo">
              <label htmlFor="contrasena">Contraseña</label>
              <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" required />
            </div>
            <button className="boton" type="submit" disabled={cargando} style={{ width: "100%" }}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
            {error ? <p className="error" role="alert">{error}</p> : null}
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
              ¿No tienes cuenta? <Link href="/registro">Crea una cuenta de paciente</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}

export default function Login() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
