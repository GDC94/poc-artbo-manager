"use client";

import { Plus } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { CARD_SURFACE_CLASSNAME } from "@/components/app/shared/cardSurface";
import { FIELD_BOX_CLASSNAME, FIELD_SURFACE_CLASSNAME } from "@/components/app/shared/fieldFocus";
import { RequiredMark } from "@/components/app/shared/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/app/shared/ToastProvider";
import { useBrand } from "@/lib/brand/store";
import { summarizeFolder } from "@/lib/files/format";
import { FOLDER_DEFS, type FolderKey } from "@/lib/files/folders";
import { useFiles } from "@/lib/files/store";
import { cn } from "@/lib/utils";

import { FolderCard } from "./FolderCard";
import { FolderSheet } from "./FolderSheet";
import { FOLDER_ICONS } from "./folder-icons";
import { useUpload } from "./useUpload";

type DraftProps = {
  initialName: string;
  initialDescription: string;
  folderBasePath: string;
};

function BrandFormFields({ initialName, initialDescription, folderBasePath }: DraftProps) {
  const { saveBrand } = useBrand();
  const { state, removeFile } = useFiles();
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [sheetFolder, setSheetFolder] = useState<FolderKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const pickerTarget = useRef<FolderKey>("imagenes");
  const upload = useUpload();

  const openPicker = (folder: FolderKey) => {
    pickerTarget.current = folder;
    pickerRef.current?.click();
  };

  const sheetFiles = sheetFolder ? state.folders[sheetFolder] : [];

  const openSheet = (folder: FolderKey, card: HTMLElement) => {
    triggerRef.current = card;
    setSheetFolder(folder);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const ok = saveBrand({ name: name.trim(), description: description.trim() });
    toast(ok ? "Marca guardada" : "No se pudo guardar en este navegador", ok ? "success" : "error");
  };

  return (
    <div className={cn("space-y-3.5 rounded-xl", CARD_SURFACE_CLASSNAME, "bg-[#0f0f10] md:p-5")}>
      <div className="grid gap-2 md:grid-cols-[208px_minmax(0,1fr)] md:gap-6">
        <Label htmlFor="brand-name" className="text-sm font-semibold text-white md:pt-2.5">
          Nombre de tu marca
          <RequiredMark />
        </Label>
        <Input
          id="brand-name"
          aria-required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_BOX_CLASSNAME}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-[208px_minmax(0,1fr)] md:gap-6">
        <div>
          <Label htmlFor="brand-description" className="text-sm font-semibold text-white">
            Descripción de tu marca
          </Label>
          <p className="mt-0.5 text-xs text-zinc-400">Cuéntanos todo sobre contexto, retos y requisitos</p>
        </div>
        <Textarea
          id="brand-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={FIELD_SURFACE_CLASSNAME}
        />
      </div>

      <div className="space-y-2 pt-3">
        <Label className="text-sm font-semibold text-white">Assets de tu marca</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
          {FOLDER_DEFS.map((def) => {
            const files = state.folders[def.key];
            const filled = files.length > 0;
            const isOpen = sheetOpen && sheetFolder === def.key;
            const Icon = FOLDER_ICONS[def.key];
            const status = summarizeFolder(files);

            const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
              // Ignore keys bubbling from the nested "+" button.
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openSheet(def.key, e.currentTarget);
              }
            };

            return (
              <FolderCard
                key={def.key}
                role="button"
                tabIndex={0}
                aria-label={`${def.label}, ${status}`}
                filled={filled}
                open={isOpen}
                className={cn(
                  "cursor-pointer hover:[--folder-fill:#232326] hover:[--folder-stroke:rgba(0,113,227,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f10]",
                  filled && "[--folder-fill:#18181b]",
                  isOpen && "[--folder-fill:#232326] [--folder-stroke:rgba(0,113,227,0.7)]",
                )}
                onClick={(e) => openSheet(def.key, e.currentTarget)}
                onKeyDown={onKeyDown}
                icon={<Icon className="size-[17px]" strokeWidth={1.6} aria-hidden />}
                action={
                  <button
                    type="button"
                    aria-label={`Agregar archivos a ${def.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPicker(def.key);
                    }}
                    className={cn(
                      "relative grid size-[26px] place-items-center rounded-md transition-colors after:absolute after:-inset-2 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]",
                      filled
                        ? "bg-[#0071e3] text-white hover:bg-[#0062c4]"
                        : "bg-[#18181b] text-white/35 hover:bg-[#0071e3] hover:text-white group-hover:bg-[#0071e3] group-hover:text-white",
                    )}
                  >
                    <Plus className="size-3" strokeWidth={2} aria-hidden />
                  </button>
                }
                label={def.label}
                sublabel={status}
              />
            );
          })}
        </div>
      </div>

      <input
        ref={pickerRef}
        type="file"
        multiple
        hidden
        aria-label="Elegir archivos"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          upload(pickerTarget.current, files);
        }}
      />

      <FolderSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next);
          if (!next) requestAnimationFrame(() => triggerRef.current?.focus());
        }}
        folder={sheetFolder}
        files={sheetFiles}
        folderBasePath={folderBasePath}
        onAddFiles={() => {
          if (sheetFolder) openPicker(sheetFolder);
        }}
        onRemoveFile={(file) => {
          if (sheetFolder) removeFile(sheetFolder, file.id);
        }}
      />

      <div className="pt-6">
        <Button
          size="lg"
          shape="pill"
          className="h-12 w-full sm:w-[250px]"
          disabled={!name.trim()}
          onClick={handleSave}
        >
          Guardar marca
        </Button>
      </div>
    </div>
  );
}

/** Brand card. Seeds its draft once the stored brand has been read (see `key`). */
export function BrandForm({ folderBasePath = "/documentos" }: { folderBasePath?: string }) {
  const { brand, ready } = useBrand();
  return (
    <BrandFormFields
      key={ready ? "ready" : "loading"}
      initialName={brand.name}
      initialDescription={brand.description}
      folderBasePath={folderBasePath}
    />
  );
}
