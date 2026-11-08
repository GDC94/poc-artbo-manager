"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { summarizeFolder } from "@/lib/files/format";
import { getFolderDef, type FolderKey } from "@/lib/files/folders";
import type { StoredFile } from "@/lib/files/reducer";
import { cn } from "@/lib/utils";

import { FileThumb } from "./FileThumb";
import { ICON_TILE_CLASSNAME, ICON_TILE_FILLED_CLASSNAME } from "./FolderCard";
import { FOLDER_ICONS } from "./folder-icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Last opened folder; kept after close so the content survives the slide-out. */
  folder: FolderKey | null;
  files: StoredFile[];
  /** Where folder pages live; the participant side uses `/documentos`. */
  folderBasePath?: string;
  onAddFiles: () => void;
  onRemoveFile: (file: StoredFile) => void;
};

/** Right-side panel listing one folder's files (Paper "Sheet"). */
export function FolderSheet({
  open,
  onOpenChange,
  folder,
  files,
  folderBasePath = "/documentos",
  onAddFiles,
  onRemoveFile,
}: Props) {
  const Icon = folder ? FOLDER_ICONS[folder] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        closeLabel="Cerrar"
        overlayClassName="bg-black/55"
        className="flex w-[384px] max-w-full flex-col gap-0 border-l border-white/10 bg-[#131314] p-0 sm:max-w-none"
      >
        <div className="flex items-center gap-3.5 border-b border-white/[0.06] px-4 py-5 sm:px-6">
          <span className={cn(ICON_TILE_CLASSNAME, ICON_TILE_FILLED_CLASSNAME)}>
            {Icon ? <Icon className="size-[17px]" strokeWidth={1.6} aria-hidden /> : null}
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-base font-normal text-white">
              {folder ? getFolderDef(folder).label : null}
            </SheetTitle>
            <SheetDescription className="text-[13px] tabular-nums text-white/55">
              {summarizeFolder(files)}
            </SheetDescription>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
            className="grid size-10 place-items-center rounded-[9px] sm:size-8 border border-white/10 bg-[#18181b] text-white/55 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 py-5 sm:px-6">
          {files.length === 0 ? (
            <p className="text-sm text-white/55">
              Esta carpeta está vacía. Agrega archivos para verlos aquí.
            </p>
          ) : (
            <ul className="grid grid-cols-3 content-start gap-x-3 gap-y-4">
              {files.map((file) => (
                <FileThumb key={file.id} file={file} onRemove={onRemoveFile} />
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-white/[0.06] px-4 py-5 sm:px-6">
          <Button
            size="xl"
            shape="pill"
            onClick={onAddFiles}
            className="w-full text-sm shadow-[0_0_0_4px_rgba(0,113,227,0.12)]"
          >
            <Plus aria-hidden />
            Agregar archivos
          </Button>
          {folder ? (
            <Link
              href={`${folderBasePath}/${folder}`}
              className="block py-2 text-center text-xs text-white/55 underline-offset-4 hover:text-white hover:underline"
            >
              Abrir la página de la carpeta
            </Link>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
