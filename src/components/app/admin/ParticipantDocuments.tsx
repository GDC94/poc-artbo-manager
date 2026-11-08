"use client";

import { useMemo } from "react";

import { BrandForm } from "@/components/app/documents/BrandForm";
import { foldersFromRequirements } from "@/lib/admin/requirements";
import { useAdmin } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";
import { FilesProvider } from "@/lib/files/store";
import type { Participant } from "@/lib/admin/types";

/** Brand form + asset folders scoped to one participant (stores keyed by owner id). */
export function ParticipantDocuments({ participant }: { participant: Participant }) {
  const { requirements } = useAdmin();
  const folders = useMemo(() => foldersFromRequirements(requirements), [requirements]);
  const defaultBrand = useMemo(
    () => ({ name: participant.institution, description: "" }),
    [participant.institution],
  );

  return (
    <BrandProvider key={participant.id} ownerId={participant.id} defaultBrand={defaultBrand}>
      <FilesProvider key={participant.id} ownerId={participant.id} initialFileStatus="approved" uploadedBy="admin">
        <h2 className="mb-5 text-2xl sm:text-3xl lg:mb-[27px] font-medium text-white">Cuéntanos sobre tu marca</h2>
        <BrandForm
          folders={folders}
          empty={{
            title: "Todavía no hay carpetas",
            hint: "Crea un requerimiento en el listado para generar una carpeta.",
          }}
          reviewable
          folderBasePath={`/admin/participantes/${participant.id}/documentos`}
        />
      </FilesProvider>
    </BrandProvider>
  );
}
