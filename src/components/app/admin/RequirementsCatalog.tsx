"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { Checkbox } from "@/components/motion/checkbox";
import { Input } from "@/components/motion/input";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { useAdmin } from "@/lib/admin/store";
import { validateRequirementName } from "@/lib/admin/requirements";
import type { Requirement } from "@/lib/admin/types";

/**
 * "Listado de requerimiento" (Paper U9-0 / V3-0 / UN-0): a plain popover with BeUI
 * Checkboxes for the catalog. A checked requirement is
 * active, meaning it is offered in every participant's dropdown (see `requirements.ts`).
 */
export function RequirementsCatalog() {
  const { requirements, addRequirement, toggleRequirement, removeRequirement } = useAdmin();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  // Kept apart from `confirming` so the label stays rendered while the modal animates out.
  const [pendingRemoval, setPendingRemoval] = useState<Requirement | null>(null);
  const [confirming, setConfirming] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const askRemoval = (requirement: Requirement) => {
    setPendingRemoval(requirement);
    setConfirming(true);
  };

  const confirmRemoval = () => {
    if (pendingRemoval) removeRequirement(pendingRemoval.id);
    setConfirming(false);
  };

  const reset = () => {
    setAdding(false);
    setName("");
    setError(undefined);
  };

  const handleOpenChange = (next: boolean, details: { event: Event }) => {
    // The modal is portalled outside the popover, so pressing it reads as an outside press.
    // The target check covers a press that lands after `confirming` already went false.
    const { target } = details.event;
    const pressedModal = target instanceof Node && modalRef.current?.contains(target);
    if (!next && (confirming || pressedModal)) return;
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = validateRequirementName(name, requirements);
    if (problem) {
      setError(problem);
      return;
    }
    addRequirement(name);
    reset();
  };

  return (
    <>
    {/* Same surface as the BeUI Select list: page background with the theme border. */}
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      align="end"
      className="w-[300px] border-border bg-background p-5"
      trigger={
        <Button type="button" variant="secondary" shape="pill" size="xl" className="w-full sm:w-auto">
          Listado de requerimiento
        </Button>
      }
    >
        {adding ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <Input
              label="Nombre del requerimiento"
              placeholder="Escribe aquí"
              value={name}
              onChange={(value) => {
                setName(value);
                if (error) setError(undefined);
              }}
              error={error}
              reserveErrorLine
              autoFocus
              classNames={{ field: "rounded-lg bg-background border-input" }}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" shape="pill" className="w-full">
                Guardar
              </Button>
              <Button type="button" variant="destructive" shape="pill" className="w-full" onClick={reset}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            {requirements.length === 0 ? (
              <div className="flex flex-col gap-1 py-2 text-center">
                <p className="text-sm font-medium text-foreground">Todavía no hay requerimientos</p>
                <p className="text-xs text-muted-foreground">Agrega el primero para ofrecerlo a los participantes.</p>
              </div>
            ) : (
              <ul className="-mx-1 flex max-h-[260px] flex-col gap-3 overflow-y-auto px-1 py-0.5" aria-label="Requerimientos">
                {requirements.map((requirement) => (
                  <li key={requirement.id} className="flex items-center justify-between gap-2">
                    <Checkbox
                      className="min-w-0 flex-1"
                      checked={requirement.active}
                      onCheckedChange={() => toggleRequirement(requirement.id)}
                      label={requirement.label}
                    />
                    <Button
                      type="button"
                      variant="ghost-destructive"
                      size="icon-xs"
                      className="shrink-0"
                      aria-label={`Eliminar ${requirement.label}`}
                      onClick={() => askRemoval(requirement)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="h-px bg-white/15" aria-hidden />
            <Button type="button" variant="secondary" shape="pill" className="w-full" onClick={() => setAdding(true)}>
              <Plus aria-hidden />
              Agregar nuevo requerimiento
            </Button>
          </div>
        )}
    </Popover>
    {/* Portalled so it stacks above the popover, which is itself portalled to <body>. */}
    {open
      ? createPortal(
          <div ref={modalRef}>
            <MorphingModal
              viewId={confirming ? "remove-requirement" : null}
              onClose={() => setConfirming(false)}
              placement="center"
              ariaLabel="¿Eliminar este requerimiento?"
              className="max-w-[400px] border-white/10 bg-[#161617]"
            >
              <div className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-medium tracking-[-0.01em] text-white">
                    ¿Eliminar este requerimiento?
                  </h2>
                  <p className="text-[13px] leading-5 text-white/60">
                    «{pendingRemoval?.label}» se eliminará para todos los participantes, incluso donde ya
                    esté seleccionado. Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    shape="pill"
                    className="h-11 w-full"
                    onClick={confirmRemoval}
                  >
                    Eliminar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    shape="pill"
                    className="h-11 w-full"
                    onClick={() => setConfirming(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </MorphingModal>
          </div>,
          document.body,
        )
      : null}
    </>
  );
}
