"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBrand } from "@/lib/brand/store";
import { summarizeFolder } from "@/lib/files/format";
import type { FolderDef } from "@/lib/files/folders";
import { folderFiles } from "@/lib/files/reducer";
import { useFiles } from "@/lib/files/store";

import { FileThumb } from "./FileThumb";
import { FolderDropzone } from "./FolderDropzone";
import { useFileRemovalDialog } from "./useFileRemovalDialog";
import { useReview } from "./useReview";
import { useUpload } from "./useUpload";

/** Dropzone page body: upload surface, back button and the folder's current files. */
export function FolderWorkspace({
  folder,
  backHref = "/documentos",
  reviewable = false,
}: {
  folder: FolderDef;
  backHref?: string;
  /** Admin only: show the approve/reject actions. */
  reviewable?: boolean;
}) {
  const { brand } = useBrand();
  const { state, removeFile } = useFiles();
  const upload = useUpload();
  const { review, comment } = useReview();
  const files = folderFiles(state, folder.key);
  const { askRemoval, dialog } = useFileRemovalDialog((f) => removeFile(folder.key, f.id), {
    portal: true,
  });

  return (
    <div className="space-y-6 pt-8 lg:pt-[60px]">
      <FolderDropzone onFiles={(files) => upload(folder.key, files)} />

      <Button asChild size="2xl" shape="pill" className="h-12 max-w-full px-6 text-[15px] font-medium lg:h-[49px] lg:px-8">
        <Link href={backHref}>
          <ArrowLeft aria-hidden />
          <span className="min-w-0 truncate">Volver a {brand.name}</span>
        </Link>
      </Button>

      {files.length > 0 ? (
        <section className="space-y-4" aria-label={folder.label}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-normal text-white">{folder.label}</h2>
            <p className="text-[13px] tabular-nums text-[#9a9aa0]">{summarizeFolder(files)}</p>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,400px),1fr))] gap-3">
            {files.map((file) => (
              <FileThumb
                key={file.id}
                file={file}
                onRemove={askRemoval}
                onReview={reviewable ? (f, status, draft) => review(folder.key, f, status, draft) : undefined}
                onComment={reviewable ? (f, text) => comment(folder.key, f, text) : undefined}
              />
            ))}
          </ul>
        </section>
      ) : null}
      {dialog}
    </div>
  );
}
