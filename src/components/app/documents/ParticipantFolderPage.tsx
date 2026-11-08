"use client";

import { FolderNotFound } from "@/components/app/documents/FolderNotFound";
import { FolderWorkspace } from "@/components/app/documents/FolderWorkspace";
import { ParticipantFilesProvider } from "@/components/app/documents/ParticipantFilesProvider";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { visibleFoldersFor } from "@/lib/admin/requirements";
import { useAdmin } from "@/lib/admin/store";
import { findFolder, type FolderKey } from "@/lib/files/folders";
import { MOCK_USER } from "@/lib/mock/user";

/** Resolves the folder against the viewer's enabled folders (client data), once the catalog is read. */
export function ParticipantFolderPage({ folder }: { folder: FolderKey }) {
  const { requirements, selections, ready } = useAdmin();
  if (!ready) return null;
  const def = findFolder(visibleFoldersFor(MOCK_USER.participantId, requirements, selections), folder);
  if (!def) return <FolderNotFound backHref="/documentos" />;

  return (
    <>
      <PageGreeting subtitle="¿Tienes alguna idea para hoy?" />
      <ParticipantFilesProvider>
        <FolderWorkspace folder={def} />
      </ParticipantFilesProvider>
    </>
  );
}
