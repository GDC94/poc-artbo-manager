/** The brand asset folders. `key` doubles as the `/documentos/[folder]` route segment. */
export const FOLDER_DEFS = [
  { key: "imagenes", label: "Imágenes" },
  { key: "iconos", label: "Íconos" },
  { key: "logos", label: "Logos" },
  { key: "ilustraciones", label: "Ilustraciones" },
  { key: "guias-de-marca", label: "Guías de marca" },
  { key: "tipografias", label: "Tipografías" },
  { key: "plantillas", label: "Plantillas" },
] as const;

export type FolderKey = (typeof FOLDER_DEFS)[number]["key"];

export const FOLDER_KEYS = FOLDER_DEFS.map((f) => f.key) as readonly FolderKey[];

export function isFolderKey(value: string): value is FolderKey {
  return (FOLDER_KEYS as readonly string[]).includes(value);
}

export function getFolderDef(key: FolderKey) {
  return FOLDER_DEFS.find((f) => f.key === key)!;
}
