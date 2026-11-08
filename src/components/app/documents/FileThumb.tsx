"use client";

import { Check, FileText, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { CARD_SURFACE_FILL_CLASSNAME } from "@/components/app/shared/cardSurface";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";
import { formatSize } from "@/lib/files/format";
import type { FileStatus, StoredFile } from "@/lib/files/reducer";
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

const STATUS_BADGE: Record<FileStatus, { label: string; text: string; dot: string }> = {
  pending: { label: "Pendiente", text: "text-amber-200", dot: "bg-amber-300" },
  approved: { label: "Aprobado", text: "text-emerald-200", dot: "bg-emerald-300" },
  rejected: { label: "Rechazado", text: "text-rose-200", dot: "bg-rose-300" },
};

const PRESS = "transition-[transform,background-color,border-color,color] active:scale-[0.97]";

type Props = {
  file: StoredFile;
  onRemove: (file: StoredFile) => void;
  /** Admin only: when set, shows the approve/reject actions for the states the file is not in. */
  onReview?: (file: StoredFile, status: Exclude<FileStatus, "pending">) => void;
  className?: string;
};

/** One file as a horizontal card: preview, name and status on one line; the admin's decision in a footer. */
export function FileThumb({ file, onRemove, onReview, className }: Props) {
  const url = useImageUrl(file);
  const reduce = useReducedMotion();
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.slice(0, 5) : null;
  const badge = STATUS_BADGE[file.status];
  const undecided = file.status === "pending";

  return (
    <li
      className={cn(
        "@container min-w-0 rounded-2xl transition-colors hover:border-white/20",
        CARD_SURFACE_FILL_CLASSNAME,
        className,
      )}
    >
      {/* Narrow card: decision in a footer. Wide card: everything on one row. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center @2xl:grid-cols-[minmax(0,1fr)_auto_auto]">
      <div className="order-1 flex min-w-0 items-center gap-3 p-3">
        <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#0a0a0b] ring-1 ring-inset ring-white/10">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-0.5 text-white/45">
              <FileText className="size-5" strokeWidth={1.5} aria-hidden />
              {extension ? <span className="font-mono text-[9px] uppercase">{extension}</span> : null}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white" title={file.name}>
            {file.name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="tabular-nums text-white/50">{formatSize(file.size)}</span>
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <motion.span
              key={file.status}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className={cn("inline-flex items-center gap-1.5 font-medium", badge.text)}
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", badge.dot)} />
              {badge.label}
            </motion.span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost-destructive"
        size="icon-sm"
        className={cn("order-2 mr-3 shrink-0 rounded-lg @2xl:order-3", PRESS)}
        aria-label={`Quitar ${file.name}`}
        onClick={() => onRemove(file)}
      >
        <X aria-hidden />
      </Button>

      {onReview ? (
        <div
          className={cn(
            "order-3 col-span-2 flex gap-2 border-t border-white/[0.07] p-2.5",
            "@2xl:order-2 @2xl:col-span-1 @2xl:border-t-0 @2xl:p-0 @2xl:pr-2",
            !undecided && "justify-end",
          )}
        >
          {file.status !== "rejected" ? (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              shape="pill"
              className={cn(undecided && "flex-1 @2xl:flex-none", PRESS)}
              aria-label={`Rechazar ${file.name}`}
              onClick={() => onReview(file, "rejected")}
            >
              Rechazar
            </Button>
          ) : null}
          {file.status !== "approved" ? (
            <Button
              type="button"
              size="sm"
              shape="pill"
              variant={undecided ? "default" : "subtle"}
              className={cn(undecided && "flex-1 @2xl:flex-none", PRESS)}
              aria-label={`Aprobar ${file.name}`}
              onClick={() => onReview(file, "approved")}
            >
              <Check aria-hidden />
              Aprobar
            </Button>
          ) : null}
        </div>
      ) : null}
      </div>
    </li>
  );
}
