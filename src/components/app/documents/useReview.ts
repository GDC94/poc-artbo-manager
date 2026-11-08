"use client";

import { useCallback } from "react";

import { useToast } from "@/components/app/shared/ToastProvider";
import type { FolderKey } from "@/lib/files/folders";
import type { FileStatus, StoredFile } from "@/lib/files/reducer";
import { useFiles } from "@/lib/files/store";

/** Records an admin decision on a file and confirms it in a toast. */
export function useReview() {
  const { setFileStatus } = useFiles();
  const { toast } = useToast();

  return useCallback(
    (folder: FolderKey, file: StoredFile, status: Exclude<FileStatus, "pending">) => {
      setFileStatus(folder, file.id, status);
      toast(`${file.name} ${status === "approved" ? "aprobado" : "rechazado"}`);
    },
    [setFileStatus, toast],
  );
}
