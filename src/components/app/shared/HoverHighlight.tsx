"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { createContext, useContext, useId, useState } from "react";

import { cn } from "@/lib/utils";

/** Same spring beui.dev uses for its shared-layout nav pill. */
const HIGHLIGHT_SPRING = { type: "spring", stiffness: 360, damping: 32, mass: 0.6 } as const;

const BLUR_VARIANTS: Variants = {
  initial: { opacity: 0, filter: "blur(6px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: (isHovering: boolean) => (isHovering ? {} : { opacity: 0, filter: "blur(6px)" }),
};

const FADE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: (isHovering: boolean) => (isHovering ? {} : { opacity: 0 }),
};

export type HoverHighlightProps = {
  /** Shared across the whole list so the pill glides between items. */
  layoutId: string;
  /** Whether the pointer is over any item of the list. */
  isListHovered: boolean;
  /** Whether the pointer is over this item. */
  isHovered: boolean;
  /** Fill and radius of the pill. */
  className?: string;
};

/**
 * The hover pill of one list item. Every item renders the positioning layer
 * while the list is hovered, but only the hovered item renders the pill, so
 * the shared `layoutId` slides it from item to item. Leaving the list fades
 * the layer out with a blur in place.
 *
 * The item must be `relative isolate`: the pill sits at `-z-10` inside that
 * stacking context, above the item's own fill and below its content.
 */
export function HoverHighlight({ layoutId, isListHovered, isHovered, className }: HoverHighlightProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence custom={isListHovered}>
      {isListHovered ? (
        <motion.span
          aria-hidden
          variants={reduceMotion ? FADE_VARIANTS : BLUR_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={isListHovered}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          {isHovered ? (
            <motion.span
              layoutId={layoutId}
              transition={reduceMotion ? { duration: 0 } : HIGHLIGHT_SPRING}
              className={cn("block h-full w-full", className)}
            />
          ) : null}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

type HoverHighlightGroupValue = {
  layoutId: string;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const HoverHighlightGroupContext = createContext<HoverHighlightGroupValue | null>(null);

type HoverHighlightGroupProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Owns the hover state of a list whose items call `useHoverHighlightItem`, so a
 * list does not have to thread `hoveredId` through its rows by hand. Renders a
 * `layoutScroll` container: the pill's layout animation stays correct when the
 * group itself is the scrolling element.
 */
export function HoverHighlightGroup({ children, className }: HoverHighlightGroupProps) {
  const layoutId = `hover-highlight-${useId()}`;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <HoverHighlightGroupContext.Provider value={{ layoutId, hoveredId, setHoveredId }}>
      <motion.div layoutScroll onMouseLeave={() => setHoveredId(null)} className={className}>
        {children}
      </motion.div>
    </HoverHighlightGroupContext.Provider>
  );
}

/** Wires one item to the nearest `HoverHighlightGroup`. */
export function useHoverHighlightItem() {
  const id = useId();
  const group = useContext(HoverHighlightGroupContext);
  if (!group) throw new Error("useHoverHighlightItem must be used inside a HoverHighlightGroup");

  return {
    onMouseEnter: () => group.setHoveredId(id),
    /** For a non-interactive item (e.g. disabled): hovering it hides the pill. */
    clearHover: () => group.setHoveredId(null),
    highlight: {
      layoutId: group.layoutId,
      isListHovered: group.hoveredId !== null,
      isHovered: group.hoveredId === id,
    },
  };
}
