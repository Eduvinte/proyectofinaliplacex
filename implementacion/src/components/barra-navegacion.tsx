import Link from "next/link";
import Icono from "./icono";
import Marca from "./marca";

type Item = {
  href: string;
  etiqueta: string;
  icono?: "agenda" | "calendario" | "inicio" | "pacientes";
  activo?: boolean;
};

export default function BarraNavegacion({ items }: { items: Item[] }) {
  return (
    <header className="barra-navegacion">
      <div className="barra-contenido">
        <Marca />
        <nav aria-label="Navegación principal">
          {items.map((item) => (
            <Link
              className={item.activo ? "nav-link activo" : "nav-link"}
              href={item.href}
              key={`${item.href}-${item.etiqueta}`}
            >
              {item.icono ? <Icono nombre={item.icono} /> : null}
              {item.etiqueta}
            </Link>
          ))}
          <Link className="nav-link cerrar-sesion" href="/api/logout">
            <Icono nombre="cerrar" />
            Cerrar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
