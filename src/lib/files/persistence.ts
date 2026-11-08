import { del, get, set } from "idb-keyval";

import { ownerKey } from "@/lib/storage/keys";

import { countPending, normalizeFolders, type StoredFile, type StoredFolders } from "./reducer";

export const LEGACY_FILES_KEY = "artbo:files:v1";

/** IndexedDB key of one owner's files (no owner keeps the legacy, unowned key). */
export function filesKey(ownerId?: string): string {
  return ownerKey(LEGACY_FILES_KEY, ownerId);
}

const hasFiles = (stored: StoredFolders | undefined): stored is StoredFolders =>
  !!stored && Object.values(stored).some((files) => (files?.length ?? 0) > 0);

/**
 * One-time move of the pre-ownership key into the owner's key (files restart as pending).
 * Only runs when the owned key holds no files, so it never overwrites real data; the legacy
 * key is deleted once copied, which makes repeat calls no-ops.
 */
async function migrateLegacy(ownedKey: string): Promise<void> {
  const legacy = await get<StoredFolders>(LEGACY_FILES_KEY);
  if (!hasFiles(legacy)) return;
  const owned = await get<StoredFolders>(ownedKey);
  if (hasFiles(owned)) return;
  const folders = normalizeFolders(legacy);
  for (const [folder, files] of Object.entries(folders)) {
    folders[folder] = files.map((f): StoredFile => ({ ...f, status: "pending" }));
  }
  await set(ownedKey, folders);
  await del(LEGACY_FILES_KEY);
}

/** Reads an owner's files (statuses normalized), optionally migrating the legacy key first. */
export async function loadFiles(
  ownerId?: string,
  options: { migrateLegacy?: boolean } = {},
): Promise<Record<string, StoredFile[]>> {
  const key = filesKey(ownerId);
  if (options.migrateLegacy && key !== LEGACY_FILES_KEY) await migrateLegacy(key);
  return normalizeFolders((await get<StoredFolders>(key)) ?? {});
}

/** Pending files per owner. Read-only; blobs are dropped as soon as they are counted. */
export async function loadPendingCounts(ownerIds: readonly string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    ownerIds.map(async (id) => {
      const stored = await get<StoredFolders>(filesKey(id)).catch(() => undefined);
      return [id, countPending({ folders: stored ?? {} })] as const;
    }),
  );
  return Object.fromEntries(entries);
}
