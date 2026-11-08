"use client";

import { useMemo } from "react";

import { ParticipantNotFound } from "@/components/app/admin/ParticipantNotFound";
import { FolderWorkspace } from "@/components/app/documents/FolderWorkspace";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { Breadcrumb } from "@/components/app/shared/Breadcrumb";
import { useAdmin } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";
import { FilesProvider } from "@/lib/files/store";
import { foldersFromRequirements } from "@/lib/admin/requirements";
import { findFolder, type FolderKey } from "@/lib/files/folders";
import { FolderNotFound } from "@/components/app/documents/FolderNotFound";

/** Folder dropzone page of one participant. */
export function ParticipantFolder({ id, folder }: { id: string; folder: FolderKey }) {
  const { participants, requirements, ready } = useAdmin();
  const participant = participants.find((p) => p.id === id);
  const institution = participant?.institution ?? "";
  const defaultBrand = useMemo(() => ({ name: institution, description: "" }), [institution]);

  if (!participant) return ready ? <ParticipantNotFound /> : null;
  // The admin reaches every catalog folder (active or not); anything else is not found.
  const folderDef = findFolder(foldersFromRequirements(requirements), folder);
  if (!folderDef) return ready ? <FolderNotFound backHref={`/admin/participantes/${id}?tab=documentos`} /> : null;
  const detailHref = `/admin/participantes/${id}`;

  return (
    <>
      <PageGreeting
        name="Admin"
        subtitle="Administra los documentos de este participante"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Participantes", href: "/admin" },
              { label: participant.fullName, href: `${detailHref}?tab=documentos` },
              { label: folderDef.label },
            ]}
          />
        }
      />
      <BrandProvider key={id} ownerId={id} defaultBrand={defaultBrand}>
        <FilesProvider key={id} ownerId={id} initialFileStatus="approved" uploadedBy="admin">
          <FolderWorkspace folder={folderDef} reviewable backHref={`${detailHref}?tab=documentos`} />
        </FilesProvider>
      </BrandProvider>
    </>
  );
}
