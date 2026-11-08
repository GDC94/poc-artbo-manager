import { cn } from "@/lib/utils";

/**
 * Hover/focus/open treatment of the `/app/requests` brand filter
 * (`MultiSelectTrigger`), shared by form fields that must match it: hover
 * lightens the border, keyboard focus draws the offset `#0071e3` ring, and an
 * open trigger (`aria-expanded`) keeps a blue border. Text fields have no open
 * state, so a focused `<input>`/`<textarea>` gets that same blue border instead
 * of the ring (browsers match `:focus-visible` on text fields even on mouse
 * click, which made them render the offset ring where the select only shows the
 * border).
 *
 * Append it last in `cn(...)` so it overrides a field's own focus outline.
 */
export const FIELD_FOCUS_CLASSNAME =
  "hover:border-foreground/40 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 aria-expanded:border-[#0071e3] [&:is(input,textarea):focus]:border-[#0071e3] [&:is(input,textarea):focus-visible]:ring-0 [&:is(input,textarea):focus-visible]:ring-offset-0";

/**
 * The field surface itself — radius, fill, border color, type ramp and shadow —
 * WITHOUT a height, so an auto-growing control (`<textarea>`) can use it too.
 * Same fill and stroke as `MotionSelectTrigger` (the `/app/billing` history
 * filters): `bg-background` sits a step DARKER than the card it lives in, which
 * is what reads as an inset field on `#131314`.
 *
 * Prefer `FIELD_BOX_CLASSNAME` for single-line controls; this one is for
 * anything that sets its own height.
 */
export const FIELD_SURFACE_CLASSNAME = cn(
  "rounded-lg border-input bg-background py-2 text-base text-foreground md:text-sm shadow-sm",
  FIELD_FOCUS_CLASSNAME,
);

/**
 * One single-line field box: `FIELD_SURFACE_CLASSNAME` at the standard 36px
 * height. This is the shape `/app/profile` and `/app/brands/[slug]` share, and
 * the shape their skeletons draw an inert copy of.
 */
export const FIELD_BOX_CLASSNAME = cn("h-11 lg:h-9", FIELD_SURFACE_CLASSNAME);
