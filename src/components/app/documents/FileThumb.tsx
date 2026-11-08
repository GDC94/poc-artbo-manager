"use client";

import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

import { formatSize } from "@/lib/files/format";
import type { StoredFile } from "@/lib/files/reducer";
import { cn } from "@/lib/utils";

/** Object URL for an image blob, revoked when the blob changes or the component unmounts. */
function useImageUrl(file: StoredFile): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(file.blob);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [file.blob, isImage]);

  return url;
}

type Props = {
  file: StoredFile;
  onRemove: (file: StoredFile) => void;
  className?: string;
};

/** One file: square thumbnail (image preview or generic file icon), remove button, name and size. */
export function FileThumb({ file, onRemove, className }: Props) {
  const url = useImageUrl(file);
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.slice(0, 5) : null;

  return (
    <li className={cn("min-w-0", className)}>
      <div className="relative aspect-square overflow-hidden rounded-[10px] border border-white/10 bg-[#0f0f10]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center bg-[repeating-linear-gradient(135deg,#16161a_0_6px,#0f0f10_6px_12px)] text-white/40">
            <div className="flex flex-col items-center gap-1">
              <FileText className="size-6" strokeWidth={1.4} aria-hidden />
              {extension ? <span className="font-mono text-[11px] uppercase">{extension}</span> : null}
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label={`Quitar ${file.name}`}
          onClick={() => onRemove(file)}
          className="absolute right-1.5 top-1.5 flex size-[26px] items-center after:absolute after:-inset-2 after:content-[''] justify-center rounded-md border border-[#2a2a30] bg-[rgba(15,15,17,.85)] text-[#cfd0d6] transition-colors hover:border-[#5c5c64] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
        >
          <X size={12} strokeWidth={2.4} aria-hidden />
        </button>
      </div>
      <p className="mt-2 truncate text-[13px] text-white" title={file.name}>
        {file.name}
      </p>
      <p className="text-xs tabular-nums text-white/55">{formatSize(file.size)}</p>
    </li>
  );
}
