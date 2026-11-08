import { get } from "idb-keyval";

import { readStoredParticipants } from "@/lib/admin/storage";
import { filesKey } from "@/lib/files/persistence";
import { normalizeFolders, type StoredFolders } from "@/lib/files/reducer";
import { MOCK_USER } from "@/lib/mock/user";

import { deriveAdminNotifications, deriveParticipantNotifications } from "./derive";
import type { Audience, Notification } from "./types";

async function readFolders(ownerId: string) {
  const stored = await get<StoredFolders>(filesKey(ownerId)).catch(() => undefined);
  return normalizeFolders(stored ?? {});
}

/**
 * Notifications of one audience, derived from the stored files. Read-only and independent of
 * any FilesProvider (the topbar lives outside them), so it always reads what is persisted.
 */
export async function loadNotifications(audience: Audience): Promise<Notification[]> {
  if (audience === "participant") {
    return deriveParticipantNotifications(await readFolders(MOCK_USER.participantId), MOCK_USER.participantId);
  }
  const owners = await Promise.all(
    readStoredParticipants().map(async (p) => ({
      participantId: p.id,
      name: p.fullName,
      folders: await readFolders(p.id),
    })),
  );
  return deriveAdminNotifications(owners);
}
