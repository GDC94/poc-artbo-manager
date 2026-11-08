"use client";

import { Check, ListFilter } from "lucide-react";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { Popover } from "@/components/ui/popover";
import {
  isParticipantType,
  PARTICIPANT_EVENTS,
  PARTICIPANT_TYPES,
  type ParticipantEvent,
  type ParticipantFilters,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type Props = {
  filters: ParticipantFilters;
  onChange: (next: ParticipantFilters) => void;
};

/** BeUI Select holds a single string value, so "no filter" is this sentinel. */
const ALL = "all";

/** Options never wrap: the label stays on one line and truncates next to the check. */
const OPTION = "whitespace-nowrap text-[13px]";

/**
 * Event filter as a compact icon button, so the header stays on one line. Opens a
 * list styled like the Select list; a blue dot marks an active event filter.
 */
function EventFilterButton({
  value,
  onChange,
}: {
  value: ParticipantEvent | null;
  onChange: (next: ParticipantEvent | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { label: string; value: ParticipantEvent | null }[] = [
    { label: "Todos los eventos", value: null },
    ...PARTICIPANT_EVENTS.map((event) => ({ label: event, value: event })),
  ];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-[210px] border-border bg-background p-1.5"
      trigger={
        <button
          type="button"
          aria-label={value ? `Filtrar por evento: ${value}` : "Filtrar por evento"}
          className="relative grid size-10 shrink-0 place-items-center rounded-lg border sm:size-8 border-border text-white outline-none transition-colors hover:border-(--color-border-strong) hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-foreground/20 aria-expanded:border-white/40"
        >
          <ListFilter className="size-4" aria-hidden />
          {value ? (
            <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#0071e3] ring-2 ring-background" />
          ) : null}
        </button>
      }
    >
      <p className="px-2.5 pb-1 pt-1.5 text-xs font-bold text-white/55">Evento</p>
      <div role="group" aria-label="Evento" className="flex flex-col">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left sm:py-1.5 text-[13px] whitespace-nowrap outline-none transition-colors",
                selected
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted",
              )}
            >
              <span className="truncate">{option.label}</span>
              {selected ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}

/**
 * "Filtrar por": a BeUI Select for the participant type plus the event icon
 * button. They combine, and picking "Todos" clears that dimension.
 */
export function FilterMenu({ filters, onChange }: Props) {
  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <span className="whitespace-nowrap text-[13px] font-bold text-white">Filtrar por</span>

      <div className="min-w-0 flex-1 sm:w-[210px] sm:flex-none">
        <Select
          value={filters.type ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, type: isParticipantType(value) ? value : null })
          }
        >
          <SelectTrigger className="h-10 text-[13px] sm:h-8">
            <SelectValue placeholder="Tipo de participante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL} className={OPTION}>
              <span className="truncate">Todos los tipos</span>
            </SelectItem>
            {PARTICIPANT_TYPES.map((type) => (
              <SelectItem key={type} value={type} className={OPTION}>
                <span className="truncate">{type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <EventFilterButton value={filters.event} onChange={(event) => onChange({ ...filters, event })} />
    </div>
  );
}
