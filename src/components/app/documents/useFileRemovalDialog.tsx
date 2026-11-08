"use client";

import { useState, type ReactNode } from "react";

import { MorphingModal } from "@/components/motion/morphing-modal";
import { Button } from "@/components/ui/button";
import type { StoredFile } from "@/lib/files/reducer";

/**
 * Confirmation before a file is deleted. State lives with the caller (the list parent),
 * not the card, because the card unmounts on delete and would cut off the exit animation.
 */
export function useFileRemovalDialog(
  onConfirm: (file: StoredFile) => void,
  options: { portal?: boolean } = {},
): {
  askRemoval: (file: StoredFile) => void;
  dialog: ReactNode;
  open: boolean;
  /** Closes the confirmation without deleting. */
  close: () => void;
} {
  // Kept apart from `open` so the name stays rendered while the modal animates out.
  const [pending, setPending] = useState<StoredFile | null>(null);
  const [open, setOpen] = useState(false);

  const askRemoval = (file: StoredFile) => {
    setPending(file);
    setOpen(true);
  };

  const confirm = () => {
    if (pending) onConfirm(pending);
    setOpen(false);
  };

  // Always rendered (closed when `viewId` is null) so AnimatePresence still plays the enter animation.
  const dialog = (
    <MorphingModal
      viewId={open ? "remove-file" : null}
      onClose={() => setOpen(false)}
      placement="center"
      portal={options.portal}
      ariaLabel="¿Eliminar este archivo?"
      className="max-w-[400px] border-white/10 bg-[#161617]"
    >
      <div className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <h2 className="text-xl font-medium tracking-[-0.01em] text-white">¿Eliminar este archivo?</h2>
          <p className="text-[13px] leading-5 text-white/60">
            «{pending?.name}» se eliminará de esta carpeta. Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="destructive" shape="pill" className="h-11 w-full" onClick={confirm}>
            Eliminar
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
