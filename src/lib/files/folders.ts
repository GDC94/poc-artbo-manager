/**
 * Seed folders. They are the initial requirement catalog (see `SEED_REQUIREMENTS`); the live
 * folder list is derived from the catalog, so new requirements add folders at runtime.
 */
export const FOLDER_DEFS = [
  { key: "imagenes", label: "Imágenes" },
  { key: "iconos", label: "Íconos" },
  { key: "logos", label: "Logos" },
  { key: "ilustraciones", label: "Ilustraciones" },
  { key: "guias-de-marca", label: "Guías de marca" },
  { key: "tipografias", label: "Tipografías" },
  { key: "plantillas", label: "Plantillas" },
] as const;

/** A folder key is the requirement id and doubles as the `/documentos/[folder]` route segment. */
export type FolderKey = string;

export type FolderDef = { key: FolderKey; label: string };

export const SEED_FOLDER_KEYS: readonly FolderKey[] = FOLDER_DEFS.map((f) => f.key);

/** Safe lookup: a stale or unknown key yields `undefined` instead of throwing. */
export function findFolder(folders: readonly FolderDef[], key: FolderKey): FolderDef | undefined {
  return folders.find((f) => f.key === key);
}
