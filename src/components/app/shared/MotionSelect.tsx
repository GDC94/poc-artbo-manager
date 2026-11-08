"use client";

// Animation adapted from beui.dev/components/motion/select; styles follow our inputs.

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { motion, type Transition, useReducedMotion, type Variants } from "framer-motion";
import {
  createContext,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HoverHighlight } from "@/components/app/shared/HoverHighlight";
import {
  type NavTarget,
  nextActiveValue,
  nextTypeaheadQuery,
  typeaheadMatch,
} from "@/components/app/shared/motionSelectNavigation";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const RADIUS = 8;
const INSTANT_TRANSITION: Transition = { duration: 0 };
const CHEVRON_TRANSITION: Transition = { type: "spring", duration: 0.4, bounce: 0.3 };

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type Placement = "bottom" | "top";

type SelectContextValue = {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  reduce: boolean;
  triggerId: string;
  listId: string;
  disabled: boolean;
  placement: Placement;
  setPlacement: (placement: Placement) => void;
  hoveredValue: string | null;
  setHoveredValue: (value: string | null) => void;
  highlightLayoutId: string;
  /** Option the keyboard is on. Drives `aria-activedescendant`; null while closed. */
  activeValue: string | null;
  /** Stable DOM id per option, so the trigger can point at the active one. */
  optionId: (value: string) => string;
  onTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error(`${component} must be used within <MotionSelect>`);
  return ctx;
}

/**
 * A key that should start or extend a typeahead query: one printable character,
 * with no modifier that would make it a shortcut. Space is excluded because the
 * listbox pattern spends it on "select the active option".
 */
function isTypeaheadKey(event: ReactKeyboardEvent<HTMLElement>) {
  return event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey;
}

type MotionSelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Inline (non-portalled) select whose panel unfolds from the trigger and
 * pinches off into its own surface. The panel is absolutely positioned inside
 * the root, so an ancestor with `overflow: hidden` clips it.
 */
export function MotionSelect({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  children,
}: MotionSelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const typeahead = useRef({ query: "", at: 0 });

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange],
  );

  const optionId = useCallback((v: string) => `${baseId}-opt-${v}`, [baseId]);

  /**
   * Options in DOM order, read from the DOM rather than from the `labels` map.
   * The map is keyed by value and keeps insertion order, which is mount order —
   * it drifts as soon as a caller inserts an option in the middle of an
   * already-rendered list. The DOM is the order the user actually sees.
   *
   * Items stay mounted while the panel is closed (see `MotionSelectContent`),
   * so this answers correctly even before the first open.
   */
  const getOptions = useCallback(() => {
    const root = rootRef.current;
    if (!root) return [] as { value: string; label: string }[];
    return Array.from(root.querySelectorAll<HTMLElement>('[role="option"]:not([disabled])')).map(
      (el) => ({ value: el.dataset.value ?? "", label: el.dataset.label ?? "" }),
    );
  }, []);

  const moveActive = useCallback(
    (to: NavTarget) => {
      const options = getOptions();
      setActiveValue((prev) => nextActiveValue(options, prev ?? current, to) ?? prev);
    },
    [getOptions, current],
  );

  const runTypeahead = useCallback(
    (key: string) => {
      const now = Date.now();
      const state = typeahead.current;
      state.query = nextTypeaheadQuery(state.query, state.at, key, now);
      state.at = now;

      const options = getOptions();
      setActiveValue((prev) => typeaheadMatch(options, prev ?? current, state.query) ?? prev);
    },
    [getOptions, current],
  );

  const onTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      if (!open) {
        if (["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          setOpen(true);
          moveActive(event.key === "ArrowUp" || event.key === "End" ? "last" : "selected");
        } else if (isTypeaheadKey(event)) {
          event.preventDefault();
          setOpen(true);
          runTypeahead(event.key);
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveActive("next");
          break;
        case "ArrowUp":
          event.preventDefault();
          moveActive("prev");
          break;
        case "Home":
          event.preventDefault();
          moveActive("first");
          break;
        case "End":
          event.preventDefault();
          moveActive("last");
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (activeValue) select(activeValue);
          else setOpen(false);
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
        // Tab closes without committing and lets focus move on: this select fires
        // a mutation per change, so leaving the field must never pick an option
        // the user only browsed past.
        case "Tab":
          setOpen(false);
          break;
        default:
          if (isTypeaheadKey(event)) {
            event.preventDefault();
            runTypeahead(event.key);
          }
      }
    },
    [disabled, open, activeValue, moveActive, runTypeahead, select],
  );

  const register = useCallback((v: string, label: string) => {
    setLabels((m) => (m.get(v) === label ? m : new Map(m).set(v, label)));
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      if (!m.has(v)) return m;
      const next = new Map(m);
      next.delete(v);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setHoveredValue(null);
      setActiveValue(null);
      typeahead.current = { query: "", at: 0 };
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // The keyboard drives the same highlight the pointer does, so arrowing through
  // the list looks like hovering it. The selected option already carries its own
  // fill, so it takes no pill — the pointer path makes the same exception.
  useEffect(() => {
    if (activeValue === null) return;
    setHoveredValue(activeValue === current ? null : activeValue);
  }, [activeValue, current]);

  const ctx = useMemo<SelectContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)),
      reduce,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      disabled,
      placement,
      setPlacement,
      hoveredValue,
      setHoveredValue,
      highlightLayoutId: `${baseId}-highlight`,
      activeValue,
      optionId,
      onTriggerKeyDown,
    }),
    [
      current,
      open,
      select,
      register,
      unregister,
      labels,
      reduce,
      baseId,
      disabled,
      placement,
      hoveredValue,
      activeValue,
      optionId,
      onTriggerKeyDown,
    ],
  );

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", open && "z-30", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function MotionSelectTrigger({
  className,
  loading = false,
  children,
  "aria-labelledby": ariaLabelledBy,
}: {
  className?: string;
  /**
   * Cambia el chevron por un spinner mientras una mutación está en vuelo.
   * Es un reemplazo y no un hijo extra a propósito: el trigger es
   * `justify-between`, así que un tercer hijo dejaría de empujar la etiqueta
   * contra el borde izquierdo y la recentraría.
   */
  loading?: boolean;
  children: ReactNode;
  /** Id of an external <Label>; the trigger owns its own id, so it cannot be a htmlFor target. */
  "aria-labelledby"?: string;
}) {
  const ctx = useSelectContext("MotionSelectTrigger");
  const isTop = ctx.placement === "top";
  // The edge facing the panel snaps flat while attached, then rounds back as it pulls away.
  const kf = ctx.open ? [0, 0, RADIUS] : [RADIUS, 0, RADIUS];
  const kfT: Transition = ctx.reduce
    ? INSTANT_TRANSITION
    : ctx.open
      ? { duration: 0.6, times: [0, 0.4, 1], ease: EASE_OUT }
      : { duration: 0.42, times: [0, 0.5, 1], ease: EASE_OUT };

  return (
    <motion.button
      type="button"
      id={ctx.triggerId}
      disabled={ctx.disabled}
      // Select-only combobox: focus never leaves the trigger, so the option the
      // arrows are on is published through `aria-activedescendant` instead of a
      // roving tabindex. Keeping focus here means closing the panel — on Escape,
      // on Tab, on select — needs no focus restoration.
      role="combobox"
      aria-labelledby={ariaLabelledBy}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-controls={ctx.listId}
      aria-activedescendant={ctx.open && ctx.activeValue ? ctx.optionId(ctx.activeValue) : undefined}
      onKeyDown={ctx.onTriggerKeyDown}
      onClick={() => ctx.setOpen(!ctx.open)}
      initial={false}
      animate={{
        borderTopLeftRadius: isTop ? kf : RADIUS,
        borderTopRightRadius: isTop ? kf : RADIUS,
        borderBottomLeftRadius: isTop ? RADIUS : kf,
        borderBottomRightRadius: isTop ? RADIUS : kf,
      }}
      transition={{
        borderTopLeftRadius: isTop ? kfT : INSTANT_TRANSITION,
        borderTopRightRadius: isTop ? kfT : INSTANT_TRANSITION,
        borderBottomLeftRadius: isTop ? INSTANT_TRANSITION : kfT,
        borderBottomRightRadius: isTop ? INSTANT_TRANSITION : kfT,
      }}
      className={cn(
        "relative z-10 flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <motion.span
          aria-hidden
          animate={{ rotate: ctx.open ? 180 : 0 }}
          transition={ctx.reduce ? INSTANT_TRANSITION : CHEVRON_TRANSITION}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      )}
    </motion.button>
  );
}

export function MotionSelectValue({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const ctx = useSelectContext("MotionSelectValue");
  const label = ctx.labelFor(ctx.value);
  return (
    <span
      className={cn(
        // Long labels end in an ellipsis instead of pushing the chevron out.
        "min-w-0 truncate text-left",
        label ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {label ?? placeholder}
    </span>
  );
}

export function MotionSelectContent({
  className,
  listClassName,
  children,
}: {
  className?: string;
  /**
   * Applied to the inner `<ul>`. A long option list caps its height here
   * (`max-h-60 overflow-y-auto`) rather than on the panel: the panel animates
   * to the measured height of this element, so capping it keeps the unfold
   * animation honest instead of clipping a taller box.
   */
  listClassName?: string;
  children: ReactNode;
}) {
  const ctx = useSelectContext("MotionSelectContent");
  const innerRef = useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState(0);
  const { open, setPlacement, triggerId } = ctx;

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Flip upward when there is no room below and more room above.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = document.getElementById(triggerId);
    const node = innerRef.current;
    if (!trigger || !node) return;
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    setPlacement(below < node.offsetHeight + 16 && rect.top > below ? "top" : "bottom");
  }, [open, triggerId, setPlacement]);

  // Every corner and both margins are set each render so no corner gets
  // stranded square when the placement flips between opens.
  const isTop = ctx.placement === "top";
  const nearGap = open ? 8 : 0;
  const nearRadius = open ? RADIUS : 0;
  const gapT: Transition = open
    ? { type: "spring", duration: 0.6, bounce: 0.5, delay: 0.12 }
    : { type: "spring", duration: 0.3, bounce: 0.1 };
  const radiusT: Transition = open
    ? { duration: 0.3, ease: EASE_OUT, delay: 0.14 }
    : { duration: 0.16, ease: EASE_OUT };

  // Items stay mounted so their label registration survives the panel closing.
  return (
    <motion.div
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={
        ctx.reduce
          ? { opacity: open ? 1 : 0, height: open ? height : 0 }
          : {
              opacity: open ? 1 : 0,
              height: open ? height : 0,
              marginTop: isTop ? 0 : nearGap,
              marginBottom: isTop ? nearGap : 0,
              borderTopLeftRadius: isTop ? RADIUS : nearRadius,
              borderTopRightRadius: isTop ? RADIUS : nearRadius,
              borderBottomLeftRadius: isTop ? nearRadius : RADIUS,
              borderBottomRightRadius: isTop ? nearRadius : RADIUS,
            }
      }
      transition={
        ctx.reduce
          ? { duration: 0.12 }
          : {
              opacity: open ? { duration: 0.18 } : { duration: 0.16, delay: 0.12 },
              height: open
                ? { type: "spring", duration: 0.42, bounce: 0.14 }
                : { duration: 0.26, ease: EASE_OUT, delay: 0.14 },
              marginTop: isTop ? INSTANT_TRANSITION : gapT,
              marginBottom: isTop ? gapT : INSTANT_TRANSITION,
              borderTopLeftRadius: isTop ? INSTANT_TRANSITION : radiusT,
              borderTopRightRadius: isTop ? INSTANT_TRANSITION : radiusT,
              borderBottomLeftRadius: isTop ? radiusT : INSTANT_TRANSITION,
              borderBottomRightRadius: isTop ? radiusT : INSTANT_TRANSITION,
            }
      }
      style={{
        transformOrigin: isTop ? "bottom" : "top",
        overflow: "hidden",
        pointerEvents: open ? "auto" : "none",
      }}
      className={cn(
        "absolute left-0 right-0 z-20 rounded-lg border border-white/10 bg-[#131314] text-white shadow-[3px_5px_30px_0px_rgba(0,0,0,0.35)]",
        isTop ? "bottom-full" : "top-full",
        className,
      )}
    >
      <motion.ul
        ref={innerRef}
        // `aria-controls` on the trigger points here, so the id rides the element
        // that actually carries `role="listbox"` rather than the animated wrapper.
        id={ctx.listId}
        role="listbox"
        aria-labelledby={ctx.triggerId}
        variants={ctx.reduce ? undefined : LIST_VARIANTS}
        initial={false}
        animate={open ? "show" : "hidden"}
        onMouseLeave={() => ctx.setHoveredValue(null)}
        className={cn("p-1", listClassName)}
      >
        {children}
      </motion.ul>
    </motion.div>
  );
}

export function MotionSelectItem({
  value,
  textValue,
  disabled = false,
  className,
  children,
}: {
  value: string;
  /** Trigger label when `children` is not a plain string (e.g. name + badge). */
  textValue?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const {
    value: selectedValue,
    register,
    unregister,
    select,
    reduce,
    hoveredValue,
    setHoveredValue,
    highlightLayoutId,
    activeValue,
    optionId,
  } = useSelectContext("MotionSelectItem");
  const selected = selectedValue === value;
  const label = textValue ?? (typeof children === "string" ? children : value);

  useLayoutEffect(() => {
    register(value, label);
    return () => unregister(value);
  }, [register, unregister, value, label]);

  return (
    <motion.li role="none" variants={reduce ? undefined : ITEM_VARIANTS}>
      <button
        type="button"
        role="option"
        id={optionId(value)}
        aria-selected={selected}
        disabled={disabled}
        // The trigger owns the keyboard, so options stay out of the tab order:
        // Tab leaves the field instead of walking into an open list.
        tabIndex={-1}
        // Read back by the select's keyboard navigation, which takes option order
        // and typeahead labels from the DOM rather than from a registry.
        data-value={value}
        data-label={label}
        onClick={() => select(value)}
        // Full text on hover, since a long label is cut with an ellipsis.
        title={label}
        // The selected option already has its fill, so it takes no pill.
        onMouseEnter={() => setHoveredValue(selected ? null : value)}
        className={cn(
          "relative isolate flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]",
          selected ? "bg-white/10 text-white" : "text-white/50 hover:text-white",
          // Focus lives on the trigger, so the active option cannot rely on
          // `:focus-visible` to read as the keyboard's position.
          activeValue === value && "text-white",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <HoverHighlight
          layoutId={highlightLayoutId}
          isListHovered={hoveredValue !== null}
          isHovered={hoveredValue === value}
          className="rounded-md bg-white/[0.06]"
        />
        {typeof children === "string" ? (
          <span className="min-w-0 truncate">{children}</span>
        ) : (
          children
        )}
        {selected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
      </button>
    </motion.li>
  );
}
