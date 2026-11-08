const KB = 1024;
const MB = KB * KB;

const sizeFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** "512 B", "45 KB" or "0,1 MB" (comma decimal separator, one decimal). */
export function formatSize(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < 0.1 * MB) return `${Math.round(bytes / KB)} KB`;
  return `${sizeFormatter.format(bytes / MB)} MB`;
}

export function pluralFiles(count: number): string {
  return `${count} ${count === 1 ? "archivo" : "archivos"}`;
}

/** "Carpeta vacía" or "3 archivos · 18,4 MB". */
export function summarizeFolder(files: readonly { size: number }[]): string {
  if (files.length === 0) return "Carpeta vacía";
  const total = files.reduce((sum, f) => sum + f.size, 0);
  return `${pluralFiles(files.length)} · ${formatSize(total)}`;
}
