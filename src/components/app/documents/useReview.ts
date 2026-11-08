"use client";

import { useCallback } from "react";

import { useToast } from "@/components/app/shared/ToastProvider";
import type { FolderKey } from "@/lib/files/folders";
import type { FileStatus, StoredFile } from "@/lib/files/reducer";
import { useFiles } from "@/lib/files/store";

/** Review actions on a file (admin decisions and deletion requests), each confirmed in a toast. */
export function useReview() {
  const { setFileStatus, setFileComment, requestFileDeletion, resolveFileDeletion } = useFiles();
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

  /** Participant side: asks the admin to delete an approved file. */
  const requestDeletion = useCallback(
    (folder: FolderKey, file: StoredFile) => {
      requestFileDeletion(folder, file.id);
      toast("Solicitud de eliminación enviada");
    },
    [requestFileDeletion, toast],
  );

  /** Admin side: answers a deletion request. Approving only lets the participant delete; it deletes nothing. */
  const resolveDeletion = useCallback(
    (folder: FolderKey, file: StoredFile, approved: boolean) => {
      resolveFileDeletion(folder, file.id, approved);
      toast(approved ? `Eliminación de ${file.name} aprobada` : `Solicitud de eliminación de ${file.name} rechazada`);
    },
    [resolveFileDeletion, toast],
  );

  return { review, comment, requestDeletion, resolveDeletion };
}
