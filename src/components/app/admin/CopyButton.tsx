"use client";

import { Copy } from "lucide-react";

import { useToast } from "@/components/app/shared/ToastProvider";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  label: string;
  className?: string;
};

/** Copies `value` to the clipboard and confirms with a "Copiado" toast. */
export function CopyButton({ value, label, className }: Props) {
  const { toast } = useToast();

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast("Copiado");
    } catch {
      toast("No se pudo copiar", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      aria-label={`Copiar ${label}`}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#0071e3] disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      <Copy className="size-4" aria-hidden />
    </button>
  );
}
