"use client";

import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Checkbox } from "@/components/motion/checkbox";
import { Input } from "@/components/motion/input";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { useAdmin } from "@/lib/admin/store";
import { validateRequirementName } from "@/lib/admin/requirements";

/**
 * "Listado de requerimiento" (Paper U9-0 / V3-0 / UN-0): a plain popover with BeUI
 * Checkboxes for the catalog. A checked requirement is
 * active, meaning it is offered in every participant's dropdown (see `requirements.ts`).
 */
export function RequirementsCatalog() {
  const { requirements, addRequirement, toggleRequirement } = useAdmin();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setAdding(false);
    setName("");
    setError(undefined);
  };

  const handleOpenChange = (next: boolean) => {
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
    // Same surface as the BeUI Select list: page background with the theme border.
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
            <ul className="-mx-1 flex max-h-[260px] flex-col gap-3 overflow-y-auto px-1 py-0.5" aria-label="Requerimientos">
              {requirements.map((requirement) => (
                <li key={requirement.id}>
                  <Checkbox
                    checked={requirement.active}
                    onCheckedChange={() => toggleRequirement(requirement.id)}
                    label={requirement.label}
                  />
                </li>
              ))}
            </ul>
            <div className="h-px bg-white/15" aria-hidden />
            <Button type="button" variant="secondary" shape="pill" className="w-full" onClick={() => setAdding(true)}>
              <Plus aria-hidden />
              Agregar nuevo requerimiento
            </Button>
          </div>
        )}
    </Popover>
  );
}
