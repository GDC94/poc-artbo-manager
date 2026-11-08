"use client";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectList,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/motion/multi-select";
import { useAdmin } from "@/lib/admin/store";

/**
 * Per-row multi-select. Offers the active catalog; the choice persists per participant.
 * Inactive requirements stay stored but are neither shown nor touched: only the
 * ids that changed within the offered options are toggled in the store.
 */
export function RequirementsSelect({ participantId }: { participantId: string }) {
  const { requirements, selections, toggleSelection } = useAdmin();
  const offered = requirements.filter((r) => r.active);
  const offeredIds = new Set(offered.map((r) => r.id));
  const value = (selections[participantId] ?? []).filter((id) => offeredIds.has(id));

  const handleChange = (next: string[]) => {
    const before = new Set(value);
    const after = new Set(next);
    for (const id of offeredIds) {
      if (before.has(id) !== after.has(id)) toggleSelection(participantId, id);
    }
  };

  return (
    <div className="w-full md:w-[220px]">
      <MultiSelect value={value} onValueChange={handleChange}>
        {/* BeUI chips, kept on one line: chips shrink and truncate with "…"
            instead of wrapping, so the table row keeps its height. */}
        <MultiSelectTrigger singleLine className="min-h-9 min-w-0 py-1 text-[13px]">
          <MultiSelectValue
            placeholder={<span className="truncate whitespace-nowrap">Elige los requerimientos</span>}
            chipClassName="h-6 min-w-0"
          />
          <MultiSelectInput collapseWhenClosed aria-label="Buscar requerimientos" placeholder="" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectList ariaLabel="Requerimientos">
            {offered.map((requirement) => (
              <MultiSelectItem key={requirement.id} value={requirement.id} textValue={requirement.label}>
                {requirement.label}
              </MultiSelectItem>
            ))}
            <MultiSelectEmpty>
              {offered.length === 0 ? "No hay requerimientos activos." : "Sin resultados."}
            </MultiSelectEmpty>
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
