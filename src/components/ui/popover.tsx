"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** The element that toggles the popover; receives the trigger props. */
  trigger: ReactElement<Record<string, unknown>>;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean, details: { event: Event }) => void;
  align?: "start" | "center" | "end";
  className?: string;
};

/** Portalled popover on the dark surface used by the admin menus (Escape and outside click close it). */
export function Popover({ trigger, children, open, onOpenChange, align = "start", className }: Props) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger render={trigger} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align={align} sideOffset={8} className="z-50">
          <PopoverPrimitive.Popup
            className={cn(
              "max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#18181b] p-3 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] outline-none",
              "origin-(--transform-origin) transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
              className,
            )}
          >
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
