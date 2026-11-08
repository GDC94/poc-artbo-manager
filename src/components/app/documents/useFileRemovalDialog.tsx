"use client";

import { useState, type ReactNode } from "react";

import { MorphingModal } from "@/components/motion/morphing-modal";
import { Button } from "@/components/ui/button";
import { participantRemoval, type StoredFile } from "@/lib/files/reducer";

/**
 * Confirmation before a file is deleted, or (participant side, with `onRequest`) before deletion
 * of an approved file is requested. With `onRequest`, files waiting for an answer open nothing. State lives with the caller (the list parent),
 * not the card, because the card unmounts on delete and would cut off the exit animation.
 */
export function useFileRemovalDialog(
  onConfirm: (file: StoredFile) => void,
  options: { portal?: boolean; onRequest?: (file: StoredFile) => void } = {},
): {
  askRemoval: (file: StoredFile) => void;
  dialog: ReactNode;
  open: boolean;
  /** Closes the confirmation without deleting. */
  close: () => void;
} {
  // Kept apart from `open` so the name stays rendered while the modal animates out.
  const [pending, setPending] = useState<StoredFile | null>(null);
  const [mode, setMode] = useState<"remove" | "request">("remove");
  const [open, setOpen] = useState(false);

  const askRemoval = (file: StoredFile) => {
    const kind = options.onRequest ? participantRemoval(file) : "direct";
    if (kind === "requested") return;
    setPending(file);
    setMode(kind === "request" ? "request" : "remove");
    setOpen(true);
  };

  const confirm = () => {
    if (pending) (mode === "request" ? options.onRequest : onConfirm)?.(pending);
    setOpen(false);
  };

  const requesting = mode === "request";

  // Always rendered (closed when `viewId` is null) so AnimatePresence still plays the enter animation.
  const dialog = (
    <MorphingModal
      viewId={open ? (requesting ? "request-file-deletion" : "remove-file") : null}
      onClose={() => setOpen(false)}
      placement="center"
      portal={options.portal}
      ariaLabel={requesting ? "Solicitar eliminación" : "¿Eliminar este archivo?"}
      className="max-w-[400px] border-white/10 bg-[#161617]"
    >
      <div className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <h2 className="text-xl font-medium tracking-[-0.01em] text-white">
            {requesting ? "Solicitar eliminación" : "¿Eliminar este archivo?"}
          </h2>
          <p className="text-[13px] leading-5 text-white/60">
            {requesting
              ? `«${pending?.name}» ya fue aprobado. El administrador debe aprobar la eliminación antes de que puedas borrarlo.`
              : `«${pending?.name}» se eliminará de esta carpeta. Esta acción no se puede deshacer.`}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={requesting ? "default" : "destructive"}
            shape="pill"
            className="h-11 w-full"
            onClick={confirm}
          >
            {requesting ? "Solicitar eliminación" : "Eliminar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="pill"
            className="h-11 w-full"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </MorphingModal>
  );

  return { askRemoval, dialog, open, close: () => setOpen(false) };
}
