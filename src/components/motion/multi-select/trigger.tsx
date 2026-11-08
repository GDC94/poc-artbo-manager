"use client";
// beui.dev/components/motion/multi-select

import { ChevronsUpDown, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { mergeRefs, useMultiSelectContext } from "./context";
import { visibleChipCount } from "./overflow";

/** Flex gap between chips (`gap-1.5`). */
const CHIP_GAP = 6;
/** Row space kept free for the input: one gap while collapsed, `min-w-20` + gap while open. */
const INPUT_RESERVE_CLOSED = CHIP_GAP;
const INPUT_RESERVE_OPEN = 80 + CHIP_GAP;

const CHIP_BASE =
  "inline-flex h-7 items-center gap-1 rounded-lg bg-muted px-2 text-xs font-medium text-foreground";
const COUNTER_BASE =
  "inline-flex h-6 shrink-0 items-center rounded-lg bg-muted px-2 text-xs font-medium text-muted-foreground";

export interface MultiSelectTriggerProps {
  children: ReactNode;
  className?: string;
  /** Local addition: keep the content on one line instead of wrapping chips. */
  singleLine?: boolean;
}

export function MultiSelectTrigger({
  children,
  className,
  singleLine = false,
}: MultiSelectTriggerProps) {
  const context = useMultiSelectContext("MultiSelectTrigger");

  return (
    <div
      ref={context.triggerRef}
      id={context.triggerId}
      data-state={context.open ? "open" : "closed"}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (
          context.disabled ||
          target === context.inputRef.current ||
          target.closest("[data-multi-select-remove]")
        ) {
          return;
        }
        event.preventDefault();
        context.inputRef.current?.focus({ preventScroll: true });
        context.setOpen(true);
      }}
      className={cn(
        "relative z-20 flex min-h-11 w-full min-w-52 cursor-text items-center gap-2 rounded-xl border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-[border-color] hover:border-(--color-border-strong)",
        "focus-within:ring-2 focus-within:ring-foreground/20",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5",
          // Single line: chips shrink and truncate their label with an ellipsis.
          singleLine ? "flex-nowrap overflow-hidden [&>*]:min-w-0" : "flex-wrap",
        )}
      >
        {children}
      </div>
      <ChevronsUpDown
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    </div>
  );
}

export interface MultiSelectValueProps {
  placeholder?: ReactNode;
  children?: (value: string, label: string) => ReactNode;
  className?: string;
  chipClassName?: string;
  /**
   * Local addition: show only the chips that fit at full width and a "+n"
   * counter for the rest, instead of shrinking every chip.
   */
  collapseOverflow?: boolean;
}

export function MultiSelectValue({
  placeholder = "Select options",
  children,
  className,
  chipClassName,
  collapseOverflow = false,
}: MultiSelectValueProps) {
  const context = useMultiSelectContext("MultiSelectValue");
  const showPlaceholder = context.values.length === 0 && !context.open;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // Starts at 0 so chips that turn out not to fit never mount (and never play an exit);
  // the layout effect below measures and sets the real count before first paint.
  const [visibleCount, setVisibleCount] = useState(collapseOverflow ? 0 : context.values.length);
  const { open } = context;
  const valueCount = context.values.length;

  useLayoutEffect(() => {
    if (!collapseOverflow) return;
    const row = wrapperRef.current?.parentElement;
    const layer = measureRef.current;
    if (!row || !layer) return;

    const measure = () => {
      const nodes = Array.from(layer.children) as HTMLElement[];
      const counter = nodes.pop();
      const next = visibleChipCount({
        widths: nodes.map((node) => node.getBoundingClientRect().width),
        available:
          row.clientWidth - (open ? INPUT_RESERVE_OPEN : INPUT_RESERVE_CLOSED),
        gap: CHIP_GAP,
        counterWidth: counter?.getBoundingClientRect().width ?? 0,
      });
      setVisibleCount((current) => (current === next ? current : next));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [collapseOverflow, open, valueCount, chipClassName, context.values]);

  const shownValues = collapseOverflow
    ? context.values.slice(0, visibleCount)
    : context.values;
  const hiddenLabels = collapseOverflow
    ? context.values.slice(visibleCount).map((value) => context.labelFor(value))
    : [];

  return (
    <div ref={wrapperRef} className={cn("contents", className)}>
      {collapseOverflow ? (
        // Zero-size clip box so the wide, invisible measuring row never adds scroll width.
        <div
          aria-hidden="true"
          inert
          className="pointer-events-none invisible absolute top-0 left-0 size-0 overflow-hidden"
        >
          <div ref={measureRef} className="flex w-max items-center gap-1.5">
            {context.values.map((value) => (
              <span
                key={value}
                className={cn(CHIP_BASE, "shrink-0 whitespace-nowrap", chipClassName)}
              >
                <span>{children ? children(value, context.labelFor(value)) : context.labelFor(value)}</span>
                <span className="-mr-1 size-5 shrink-0" />
              </span>
            ))}
            <span data-measure-counter="" className={cn(COUNTER_BASE, chipClassName)}>
              +{context.values.length}
            </span>
          </div>
        </div>
      ) : null}
      <AnimatePresence initial={false} mode="popLayout">
        {showPlaceholder ? (
          <span key="multi-select-placeholder" className="text-muted-foreground">
            {placeholder}
          </span>
        ) : null}
        {shownValues.map((value) => {
          const label = context.labelFor(value);
          return (
            <motion.span
              layout={context.reduce ? false : "position"}
              key={`multi-select-value-${value}`}
              initial={{
                opacity: 0,
                clipPath: "inset(0 0 0 0% round 0.5rem)",
                transform: context.reduce
                  ? "translateY(0px) scale(1)"
                  : "translateY(6px) scale(0.92)",
              }}
              animate={{
                opacity: 1,
                clipPath: "inset(0 0 0 0% round 0.5rem)",
                transform: "translateY(0px) scale(1)",
              }}
              exit={{
                opacity: 1,
                clipPath: context.reduce
                  ? "inset(0 0 0 0% round 0.5rem)"
                  : "inset(0 0 0 100% round 0.5rem)",
                transform: "translateY(0px) scale(1)",
                transition: {
                  clipPath: context.reduce
                    ? { duration: 0 }
                    : { duration: 0.16, ease: EASE_OUT },
                  transform: { duration: 0 },
                },
              }}
              transition={
                context.reduce
                  ? {
                      layout: { duration: 0 },
                      opacity: { duration: 0.15, ease: EASE_OUT },
                      transform: { duration: 0 },
                    }
                  : {
                      layout: SPRING_LAYOUT,
                      opacity: { duration: 0.18, ease: EASE_OUT },
                      transform: SPRING_SWAP,
                    }
              }
              className={cn(CHIP_BASE, "max-w-full", chipClassName)}
            >
              <span className="truncate">
                {children ? children(value, label) : label}
              </span>
              <button
                type="button"
                data-multi-select-remove=""
                aria-label={`Remove ${label}`}
                disabled={context.disabled}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  context.remove(value);
                  context.inputRef.current?.focus({ preventScroll: true });
                }}
                className="-mr-1 grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
      {hiddenLabels.length > 0 ? (
        <span
          title={hiddenLabels.join(", ")}
          aria-label={`${hiddenLabels.length} más: ${hiddenLabels.join(", ")}`}
          className={cn(COUNTER_BASE, chipClassName)}
        >
          +{hiddenLabels.length}
        </span>
      ) : null}
    </div>
  );
}

export interface MultiSelectInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "value"
  > {
  ref?: Ref<HTMLInputElement>;
  showIcon?: boolean;
  /** Local addition: take no width while the list is closed and values are shown. */
  collapseWhenClosed?: boolean;
}

export function MultiSelectInput({
  ref,
  className,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  showIcon = false,
  collapseWhenClosed = false,
  ...props
}: MultiSelectInputProps) {
  const context = useMultiSelectContext("MultiSelectInput");

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "Backspace" && !context.query && context.values.length) {
      event.preventDefault();
      context.remove(context.values.at(-1) ?? "");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!context.open) {
        context.setOpen(true);
        return;
      }
      context.moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Home" && context.open) {
      event.preventDefault();
      context.moveActive("first");
    } else if (event.key === "End" && context.open) {
      event.preventDefault();
      context.moveActive("last");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (context.open) context.toggleActive();
      else context.setOpen(true);
    } else if (event.key === "Escape" && context.open) {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-20 flex-1 items-center gap-1.5",
        collapseWhenClosed &&
          !context.open &&
          context.values.length > 0 &&
          "w-0 min-w-0 flex-none overflow-hidden",
      )}
    >
      {showIcon ? (
        <Search aria-hidden="true" className="size-3.5 text-muted-foreground" />
      ) : null}
      <input
        {...props}
        ref={mergeRefs(ref, context.inputRef)}
        id={context.inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-activedescendant={
          context.open ? context.activeItemId : undefined
        }
        autoComplete="off"
        disabled={context.disabled}
        value={context.query}
        placeholder={context.values.length ? "" : placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          context.setOpen(true);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onClick={(event) => {
          context.setOpen(true);
          onClick?.(event);
        }}
        onChange={(event) => {
          context.setOpen(true);
          context.setQuery(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-7 min-w-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className,
        )}
      />
    </div>
  );
}
