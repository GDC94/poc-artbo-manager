import {
  BookOpen,
  Camera,
  Image as ImageIcon,
  LayoutTemplate,
  PenTool,
  Shapes,
  Type,
  type LucideIcon,
} from "lucide-react";

import type { FolderKey } from "@/lib/files/folders";

export const FOLDER_ICONS: Record<FolderKey, LucideIcon> = {
  imagenes: Camera,
  iconos: Shapes,
  logos: ImageIcon,
  ilustraciones: PenTool,
  "guias-de-marca": BookOpen,
  tipografias: Type,
  plantillas: LayoutTemplate,
};
