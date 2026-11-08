/** Parses a stored JSON string, returning `fallback` for null, bad JSON or the wrong shape. */
export function parseStored<T>(
  raw: string | null,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (raw === null) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function readLocal<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    return parseStored(window.localStorage.getItem(key), fallback, isValid);
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
