"use client";

import { FilesProvider } from "@/lib/files/store";
import { MOCK_USER } from "@/lib/mock/user";

/**
 * The viewer's own files, shared with the admin through the same IndexedDB key.
 * Mounted per participant surface (not at the root) so each visit re-reads what the admin
 * decided instead of writing back a stale copy.
 */
export function ParticipantFilesProvider({ children }: { children: React.ReactNode }) {
  return (
    <FilesProvider key={MOCK_USER.participantId} ownerId={MOCK_USER.participantId} migrateLegacy>
      {children}
    </FilesProvider>
  );
}
