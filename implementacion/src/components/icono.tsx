import type { SVGProps } from "react";

type NombreIcono =
  | "agenda"
  | "atencion"
  | "calendario"
  | "cerrar"
  | "chevron"
  | "historial"
  | "inicio"
  | "paciente"
  | "pacientes"
  | "reloj"
  | "seguridad"
  | "suma"
  | "verificado";

type Props = SVGProps<SVGSVGElement> & { nombre: NombreIcono };

export default function Icono({ nombre, ...props }: Props) {
  const contenido: Record<NombreIcono, React.ReactNode> = {
    agenda: (
      <>
        <path d="M4 5.5h16v14H4z" />
        <path d="M8 3v5M16 3v5M4 10h16" />
      </>
    ),
    atencion: (
      <>
        <path d="M8 3v4a4 4 0 0 0 8 0V3M6 3h4M14 3h4" />
        <path d="M12 11v2a5 5 0 0 0 10 0v-1" />
        <circle cx="21" cy="10" r="1" />
      </>
    ),
    calendario: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    cerrar: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    historial: (
      <>
        <path d="M6 3h9l4 4v14H6zM15 3v5h5" />
        <path d="M9 13h6M12 10v6" />
      </>
    ),
    inicio: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </>
    ),
    paciente: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    pacientes: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 4.5" />
      </>
    ),
    reloj: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    seguridad: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    suma: <path d="M12 5v14M5 12h14" />,
    verificado: <path d="m5 13 4 4L19 7" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {contenido[nombre]}
    </svg>
  );
}
