export function fechaTexto(d: Date): string {
  const [a, m, dia] = d.toISOString().slice(0, 10).split("-");
  return `${dia}-${m}-${a}`;
}

export function horaTexto(d: Date): string {
  return d.toISOString().slice(11, 16);
}
