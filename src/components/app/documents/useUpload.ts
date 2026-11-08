"use client";

import { useCallback } from "react";

import { useToast } from "@/components/app/shared/ToastProvider";
import { MAX_FILE_MB } from "@/lib/files/constants";
import { pluralFiles } from "@/lib/files/format";
import type { FolderKey } from "@/lib/files/folders";
import { useFiles } from "@/lib/files/store";

/** Adds picked/dropped files to a folder and reports the outcome in a toast. */
export function useUpload() {
  const { addFiles } = useFiles();
  const { toast } = useToast();

  return useCallback(
    (folder: FolderKey, files: File[]) => {
      if (files.length === 0) return;
      const rejected = addFiles(folder, files);
      const added = files.length - rejected.length;
      if (added > 0) toast(`${pluralFiles(added)} ${added === 1 ? "agregado" : "agregados"}`);
      if (rejected.length > 0) {
        toast(
          rejected.length === 1
            ? `"${rejected[0].name}" supera el límite de ${MAX_FILE_MB} MB`
            : `${rejected.length} archivos superan el límite de ${MAX_FILE_MB} MB`,
          "error",
        );
      }
    },
    [addFiles, toast],
  );
}
