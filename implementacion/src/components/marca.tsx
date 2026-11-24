import Link from "next/link";

export default function Marca() {
  return (
    <Link className="marca" href="/" aria-label="SaludVida, inicio">
      <svg aria-hidden="true" viewBox="0 0 48 48">
        <path d="M24 41S6 31.5 6 17.5C6 10.6 14.4 7 20 12.6L24 17l4-4.4C33.6 7 42 10.6 42 17.5 42 31.5 24 41 24 41Z" />
        <path d="M11 24h7l3-7 5 14 4-9 2 2h6" />
      </svg>
      <span>Salud<span>Vida</span></span>
    </Link>
  );
}
