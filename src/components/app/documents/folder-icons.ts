import {
  BookOpen,
  Camera,
  Folder,
  Image as ImageIcon,
  LayoutTemplate,
  PenTool,
  Shapes,
  Type,
  type LucideIcon,
} from "lucide-react";

import type { FolderKey } from "@/lib/files/folders";

const KNOWN_FOLDER_ICONS: Record<string, LucideIcon> = {
  imagenes: Camera,
  iconos: Shapes,
  logos: ImageIcon,
  ilustraciones: PenTool,
  "guias-de-marca": BookOpen,
  tipografias: Type,
  plantillas: LayoutTemplate,
};

/** Seed folders keep their icon; folders created from new requirements use a generic one. */
export function getFolderIcon(key: FolderKey): LucideIcon {
  return Object.hasOwn(KNOWN_FOLDER_ICONS, key) ? KNOWN_FOLDER_ICONS[key] : Folder;
}
