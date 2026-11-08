"use client";

import { Check, FileText, Trash2, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";


import { CARD_SURFACE_FILL_CLASSNAME } from "@/components/app/shared/cardSurface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EASE_OUT } from "@/lib/ease";
import { formatSize } from "@/lib/files/format";
import { participantRemoval, type FileStatus, type StoredFile } from "@/lib/files/reducer";
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

/** Participant-side note about the deletion request of an approved file. */
const REMOVAL_NOTE = {
  requested: { label: "Eliminación solicitada", text: "text-amber-200" },
  allowed: { label: "Eliminación aprobada", text: "text-emerald-200" },
  rejected: { label: "Solicitud de eliminación rechazada", text: "text-rose-200" },
} as const;

const PRESS = "transition-[transform,background-color,border-color,color] active:scale-[0.97]";

type Props = {
  file: StoredFile;
  onRemove: (file: StoredFile) => void;
  /** Admin only: when set, shows the approve/reject actions for the states the file is not in. */
  onReview?: (file: StoredFile, status: Exclude<FileStatus, "pending">, comment?: string) => void;
  /** Admin only: with `onReview`, shows the comment box; the participant sees the saved comment read-only. */
  onComment?: (file: StoredFile, comment: string) => void;
  /** Admin only: with `onReview`, answers the participant's pending deletion request. */
  onResolveDeletion?: (file: StoredFile, approved: boolean) => void;
  className?: string;
};

/** One file as a horizontal card: preview, name and status on one line; the admin's decision in a footer. */
export function FileThumb({ file, onRemove, onReview, onComment, onResolveDeletion, className }: Props) {
  const url = useImageUrl(file);
  const reduce = useReducedMotion();
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.slice(0, 5) : null;
  const badge = STATUS_BADGE[file.status];
  const undecided = file.status === "pending";
  // The admin deletes freely; the participant's options depend on the file's deletion request.
  const removal = onReview ? "direct" : participantRemoval(file);
  const requestStatus = file.deletionRequest?.status;
  const note =
    removal === "requested"
      ? REMOVAL_NOTE.requested
      : removal === "allowed"
        ? REMOVAL_NOTE.allowed
        : removal === "request" && requestStatus === "rejected"
          ? REMOVAL_NOTE.rejected
          : null;
  const removeLabel =
    removal === "request"
      ? `Solicitar eliminación de ${file.name}`
      : removal === "requested"
        ? `Eliminación solicitada de ${file.name}`
        : `Quitar ${file.name}`;
  const saved = file.comment ?? "";
  const [draft, setDraft] = useState(saved);
  const [prevSaved, setPrevSaved] = useState(saved);
  // Adopt a comment saved elsewhere (or just now) unless the admin is mid-edit on something else.
  if (saved !== prevSaved) {
    setPrevSaved(saved);
    if (draft === prevSaved || draft.trim() === saved) setDraft(saved);
  }
  const dirty = draft.trim() !== saved;

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
          {note ? (
            <p className={cn("mt-1 flex items-center gap-1.5 text-xs", note.text)}>
              <Trash2 aria-hidden className="size-3 shrink-0" />
              <span className="min-w-0 truncate">{note.label}</span>
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost-destructive"
        size="icon-sm"
        className={cn("order-2 mr-3 shrink-0 rounded-lg @2xl:order-3", PRESS)}
        aria-label={removeLabel}
        disabled={removal === "requested"}
        onClick={() => onRemove(file)}
      >
        <X aria-hidden />
      </Button>

      {onReview ? (
        <div
          className={cn(
            "order-4 col-span-2 flex gap-2 border-t border-white/[0.07] p-2.5",
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
              onClick={() => onReview(file, "rejected", dirty ? draft : undefined)}
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
              onClick={() => onReview(file, "approved", dirty ? draft : undefined)}
            >
              <Check aria-hidden />
              Aprobar
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Pending deletion request: its own full-width row above the comment box. */}
      {onReview && onResolveDeletion && file.deletionRequest?.status === "requested" ? (
        <div className="order-3 col-span-full flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] p-2.5 @2xl:order-4 @2xl:px-3">
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-amber-200">
            <Trash2 aria-hidden className="size-3.5 shrink-0" />
            El participante solicitó eliminar este archivo
          </p>
          <div className="flex w-full gap-2 @md:w-auto">
            <Button
              type="button"
              variant="subtle"
              size="sm"
              shape="pill"
              className={cn("flex-1 @md:flex-none", PRESS)}
              aria-label={`Rechazar solicitud de eliminación de ${file.name}`}
              onClick={() => onResolveDeletion(file, false)}
            >
              Rechazar solicitud
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              shape="pill"
              className={cn("flex-1 @md:flex-none", PRESS)}
              aria-label={`Aprobar eliminación de ${file.name}`}
              onClick={() => onResolveDeletion(file, true)}
            >
              Aprobar eliminación
            </Button>
          </div>
        </div>
      ) : null}

      {/* Own full-width row: after the main row on narrow cards, below the one-row layout on wide ones. */}
      {onReview && onComment ? (
        <div className="order-3 col-span-full space-y-2 border-t border-white/[0.07] p-2.5 @2xl:order-4 @2xl:px-3">
          <Textarea
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Deja un comentario sobre este archivo"
            aria-label={`Comentario para ${file.name}`}
            className="min-h-0 resize-none rounded-lg border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white placeholder:text-white/35 md:text-sm"
          />
          {dirty ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="subtle"
                size="sm"
                shape="pill"
                className={PRESS}
                aria-label={`Guardar comentario de ${file.name}`}
                onClick={() => onComment(file, draft)}
              >
                Guardar comentario
              </Button>
            </div>
          ) : null}
        </div>
      ) : !onReview && file.comment ? (
        <div className="order-3 col-span-full border-t border-white/[0.07] px-3 py-2.5 @2xl:order-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">Comentario del administrador</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/80">{file.comment}</p>
        </div>
      ) : null}
      </div>
    </li>
  );
}
