import type { StoredFile } from "@/lib/files/reducer";

import type { Notification } from "./types";

type FolderMap = Partial<Record<string, StoredFile[]>>;

export type OwnerFiles = { participantId: string; name: string; folders: FolderMap };

/**
 * Whether a file was uploaded by the participant. Participant uploads start "pending", and
 * once the admin decides they carry `reviewedAt`, so they stay listed after the decision.
 * Admin uploads are created "approved" and never reviewed, so they match neither.
 */
export function isParticipantUpload(file: StoredFile): boolean {
  return file.status === "pending" || file.reviewedAt !== undefined;
}

const newestFirst = (a: Notification, b: Notification) => b.at - a.at;

/** Decisions and comments the admin left on the participant's own files. */
export function deriveParticipantNotifications(folders: FolderMap, participantId: string): Notification[] {
  const out: Notification[] = [];
  for (const [folder, files] of Object.entries(folders)) {
    for (const file of files ?? []) {
      const base = { fileName: file.name, folder, participantId };
      const commentedAt = file.comment ? file.commentedAt : undefined;
      if (file.reviewedAt !== undefined && (file.status === "approved" || file.status === "rejected")) {
        // One notification per file: a comment folds into the decision instead of adding a second.
        const verb = file.status === "approved" ? "aprobado" : "rechazado";
        out.push(
          commentedAt !== undefined
            ? {
                ...base,
                id: `${file.status}:${file.id}:${file.reviewedAt}:${commentedAt}`,
                kind: file.status,
                title: `${file.name} fue ${verb} con un comentario`,
                at: Math.max(file.reviewedAt, commentedAt),
              }
            : {
                ...base,
                id: `${file.status}:${file.id}:${file.reviewedAt}`,
                kind: file.status,
                title: `${file.name} fue ${verb}`,
                at: file.reviewedAt,
              },
        );
      } else if (commentedAt !== undefined) {
        out.push({
          ...base,
          id: `commented:${file.id}:${commentedAt}`,
          kind: "commented",
          title: `Nuevo comentario en ${file.name}`,
          at: commentedAt,
        });
      }
    }
  }
  return out.sort(newestFirst);
}

/** One "uploaded" per participant-uploaded file, across every participant. */
export function deriveAdminNotifications(owners: readonly OwnerFiles[]): Notification[] {
  const out: Notification[] = [];
  for (const owner of owners) {
    for (const [folder, files] of Object.entries(owner.folders)) {
      for (const file of files ?? []) {
        if (!isParticipantUpload(file)) continue;
        out.push({
          // No decision data in the id: deciding must not make the upload unread again.
          id: `uploaded:${file.id}`,
          kind: "uploaded",
          title: `${owner.name} subió ${file.name}`,
          fileName: file.name,
          folder,
          participantId: owner.participantId,
          at: file.addedAt,
        });
      }
    }
  }
  return out.sort(newestFirst);
}
