"use client";

import { CloudUpload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FolderShape } from "@/components/app/shared/FolderShape";
import { Button } from "@/components/ui/button";
import { MAX_FILE_MB } from "@/lib/files/constants";
import { cn } from "@/lib/utils";

type Props = {
  onFiles: (files: File[]) => void;
};

/**
 * Click / drop target shaped like a folder. The whole box opens the hidden file input;
 * "Elegir archivos" is the keyboard path (its click bubbles to the box).
 */
export function FolderDropzone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Esc cancels a drag in progress (the browser doesn't fire dragleave for it).
  useEffect(() => {
    if (!dragging) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDragging(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dragging]);

  return (
    <div
      data-dragging={dragging}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
      className={cn(
        "relative isolate flex min-h-[104px] cursor-pointer px-4 pb-6 pt-[34px] sm:px-7 [--folder-fill:#0f0f11]",
        "[--folder-dash:6_6] [--folder-stroke-width:1] [--folder-stroke:#3a3a42]",
        "data-[dragging=true]:[--folder-dash:none] data-[dragging=true]:[--folder-fill:rgba(0,113,227,.08)] data-[dragging=true]:[--folder-stroke-width:1.5] data-[dragging=true]:[--folder-stroke:#0071e3]",
      )}
    >
      <FolderShape />
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        aria-label="Elegir archivos"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          onFiles(files);
        }}
      />
      <div className="flex w-full flex-wrap items-center gap-3.5">
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
            dragging
              ? "border-[#0071e3]/50 bg-[#141417] text-[#0071e3]"
              : "border-[#26262c] bg-[#141417] text-[#9a9aa0]",
          )}
        >
          <CloudUpload size={18} strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-white">
            {dragging ? "Suelta los archivos aquí" : "Arrastra archivos aquí"}
          </p>
          <p className="text-[13px] text-[#9a9aa0]">
            Cualquier formato · hasta {MAX_FILE_MB} MB por archivo
          </p>
        </div>
        <Button type="button" shape="pill" variant="outline" size="sm">
          Elegir archivos
        </Button>
      </div>
    </div>
  );
}
