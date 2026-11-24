import Link from "next/link";
import Marca from "./marca";

export default function CabeceraPublica() {
  return (
    <header className="barra-navegacion">
      <div className="barra-contenido">
        <Marca />
        <nav aria-label="Navegación pública">
          <Link className="nav-link" href="/">Volver al inicio</Link>
        </nav>
      </div>
    </header>
  );
}
