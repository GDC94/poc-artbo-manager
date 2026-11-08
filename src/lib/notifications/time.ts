const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Short Spanish relative time: "Ahora", "Hace 5 min", "Hace 2 h", "Hace 3 d". */
export function formatRelativeTime(at: number, now: number): string {
  const diff = now - at;
  if (diff < MIN) return "Ahora";
  if (diff < HOUR) return `Hace ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `Hace ${Math.floor(diff / HOUR)} h`;
  return `Hace ${Math.floor(diff / DAY)} d`;
}
