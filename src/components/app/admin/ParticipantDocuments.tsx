"use client";

import { useMemo } from "react";

import { BrandForm } from "@/components/app/documents/BrandForm";
import { BrandProvider } from "@/lib/brand/store";
import { FilesProvider } from "@/lib/files/store";
import type { Participant } from "@/lib/admin/types";

/** Brand form + asset folders scoped to one participant (stores keyed by owner id). */
export function ParticipantDocuments({ participant }: { participant: Participant }) {
  const defaultBrand = useMemo(
    () => ({ name: participant.institution, description: "" }),
    [participant.institution],
  );

  return (
    <BrandProvider key={participant.id} ownerId={participant.id} defaultBrand={defaultBrand}>
      <FilesProvider key={participant.id} ownerId={participant.id}>
        <h2 className="mb-5 text-2xl sm:text-3xl lg:mb-[27px] font-medium text-white">Cuéntanos sobre tu marca</h2>
        <BrandForm folderBasePath={`/admin/participantes/${participant.id}/documentos`} />
      </FilesProvider>
    </BrandProvider>
  );
}
