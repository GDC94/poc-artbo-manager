import type { StoredFile } from "@/lib/files/reducer";

import type { Notification } from "./types";

type FolderMap = Partial<Record<string, StoredFile[]>>;

export type OwnerFiles = { participantId: string; name: string; folders: FolderMap };

/**
 * Whether a file was uploaded by the participant. Uses the stamped `uploadedBy` when present.
 * Legacy files (stored before that field existed) fall back to the old inference: participant
 * uploads start "pending" and carry `reviewedAt` once decided, while admin uploads were created
 * "approved" and never reviewed.
 */
export function isParticipantUpload(file: StoredFile): boolean {
  if (file.uploadedBy) return file.uploadedBy === "participant";
  return file.status === "pending" || file.reviewedAt !== undefined;
}

const newestFirst = (a: Notification, b: Notification) => b.at - a.at;

/** Decisions and comments on the participant's own uploads, plus answers to their deletion requests. */
export function deriveParticipantNotifications(folders: FolderMap, participantId: string): Notification[] {
  const out: Notification[] = [];
  for (const [folder, files] of Object.entries(folders)) {
    for (const file of files ?? []) {
      const base = { fileName: file.name, folder, participantId };
      const request = file.deletionRequest;
      if (request && request.status !== "requested" && request.resolvedAt !== undefined) {
        const approved = request.status === "approved";
        out.push({
          ...base,
          id: `deletion_${request.status}:${file.id}:${request.resolvedAt}`,
          kind: approved ? "deletion_approved" : "deletion_rejected",
          title: approved
            ? `Puedes eliminar ${file.name}: tu solicitud fue aprobada`
            : `Tu solicitud para eliminar ${file.name} fue rechazada`,
          at: request.resolvedAt,
        });
      }
      // The admin's own uploads carry no decision or comment notifications.
      if (!isParticipantUpload(file)) continue;
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

/** One "uploaded" per participant-uploaded file, plus one per pending deletion request, across every participant. */
export function deriveAdminNotifications(owners: readonly OwnerFiles[]): Notification[] {
  const out: Notification[] = [];
  for (const owner of owners) {
    for (const [folder, files] of Object.entries(owner.folders)) {
      for (const file of files ?? []) {
        const request = file.deletionRequest;
        if (request?.status === "requested") {
          out.push({
            id: `deletion_requested:${file.id}:${request.requestedAt}`,
            kind: "deletion_requested",
            title: `${owner.name} solicitó eliminar ${file.name}`,
            fileName: file.name,
            folder,
            participantId: owner.participantId,
            at: request.requestedAt,
          });
        }
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
