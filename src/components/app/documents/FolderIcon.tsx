import { createElement } from "react";
import type { LucideProps } from "lucide-react";

import type { FolderKey } from "@/lib/files/folders";

import { getFolderIcon } from "./folder-icons";

/** Renders the icon of a folder (known icon or the generic fallback). */
export function FolderIcon({ folderKey, ...props }: { folderKey: FolderKey } & LucideProps) {
  return createElement(getFolderIcon(folderKey), props);
}
