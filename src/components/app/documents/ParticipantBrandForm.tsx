"use client";

import { useMemo } from "react";

import { visibleFoldersFor } from "@/lib/admin/requirements";
import { useAdmin } from "@/lib/admin/store";
import { MOCK_USER } from "@/lib/mock/user";

import { BrandForm } from "./BrandForm";
import { ParticipantFilesProvider } from "./ParticipantFilesProvider";

/** Participant-side brand card: only the folders the admin enabled for the viewer. */
export function ParticipantBrandForm() {
  const { requirements, selections, ready } = useAdmin();
  const folders = useMemo(
    () => visibleFoldersFor(MOCK_USER.participantId, requirements, selections),
    [requirements, selections],
  );
  // Until the stored catalog is read, the seed would flash folders that may be disabled.
  if (!ready) return null;
  return (
    <ParticipantFilesProvider>
      <BrandForm folders={folders} />
    </ParticipantFilesProvider>
  );
}
