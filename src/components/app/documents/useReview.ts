"use client";

import { useCallback } from "react";

import { useToast } from "@/components/app/shared/ToastProvider";
import type { FolderKey } from "@/lib/files/folders";
import type { FileStatus, StoredFile } from "@/lib/files/reducer";
import { useFiles } from "@/lib/files/store";

/** Admin review actions on a file, each confirmed in a toast. */
export function useReview() {
  const { setFileStatus, setFileComment } = useFiles();
  const { toast } = useToast();

  /** Records a decision; a `comment` (the dirty draft) is saved in the same action. */
  const review = useCallback(
    (folder: FolderKey, file: StoredFile, status: Exclude<FileStatus, "pending">, comment?: string) => {
      if (comment !== undefined) setFileComment(folder, file.id, comment);
      setFileStatus(folder, file.id, status);
      const decision = status === "approved" ? "aprobado" : "rechazado";
      toast(comment !== undefined ? `${file.name} ${decision} con comentario` : `${file.name} ${decision}`);
    },
    [setFileStatus, setFileComment, toast],
  );

  const comment = useCallback(
    (folder: FolderKey, file: StoredFile, text: string) => {
      setFileComment(folder, file.id, text);
      toast(text.trim() ? "Comentario guardado" : "Comentario eliminado");
    },
    [setFileComment, toast],
  );

  return { review, comment };
}
