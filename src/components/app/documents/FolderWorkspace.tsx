"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBrand } from "@/lib/brand/store";
import { summarizeFolder } from "@/lib/files/format";
import type { FolderKey } from "@/lib/files/folders";
import { getFolderDef } from "@/lib/files/folders";
import { useFiles } from "@/lib/files/store";

import { FileThumb } from "./FileThumb";
import { FolderDropzone } from "./FolderDropzone";
import { useUpload } from "./useUpload";

/** Dropzone page body: upload surface, back button and the folder's current files. */
export function FolderWorkspace({
  folder,
  backHref = "/documentos",
}: {
  folder: FolderKey;
  backHref?: string;
}) {
  const { brand } = useBrand();
  const { state, removeFile } = useFiles();
  const upload = useUpload();
  const files = state.folders[folder];

  return (
    <div className="space-y-6 pt-8 lg:pt-[60px]">
      <FolderDropzone onFiles={(files) => upload(folder, files)} />

      <Button asChild size="2xl" shape="pill" className="h-12 max-w-full px-6 text-[15px] font-medium lg:h-[49px] lg:px-8">
        <Link href={backHref}>
          <ArrowLeft aria-hidden />
          <span className="min-w-0 truncate">Volver a {brand.name}</span>
        </Link>
      </Button>

      {files.length > 0 ? (
        <section className="space-y-4" aria-label={getFolderDef(folder).label}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-normal text-white">{getFolderDef(folder).label}</h2>
            <p className="text-[13px] tabular-nums text-[#9a9aa0]">{summarizeFolder(files)}</p>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3.5 gap-y-[18px]">
            {files.map((file) => (
              <FileThumb key={file.id} file={file} onRemove={(f) => removeFile(folder, f.id)} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
