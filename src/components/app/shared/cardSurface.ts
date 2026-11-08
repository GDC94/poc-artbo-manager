/**
 * The dark card surface shared by `ExtendedProfileFormFrame` and
 * `BrandEditFormFrame`: border, fill, padding and text color, WITHOUT a
 * radius or vertical rhythm (`space-y-*`) — those two differ between the two
 * cards (`rounded-lg` vs `rounded-xl`, and only the brand card stacks its own
 * sections with `space-y-5 sm:space-y-6`), so each frame appends its own on
 * top via `cn(...)`.
 *
 * `CARD_SURFACE_FILL_CLASSNAME` is the border + fill alone, for cards that
 * bring their own padding (e.g. the brief preview cards).
 *
 * Pulled out so the two frames cannot drift on the box they visually share —
 * same reasoning as `FIELD_BOX_CLASSNAME` in `fieldFocus.ts` for form fields.
 */
export const CARD_SURFACE_FILL_CLASSNAME = "border border-white/10 bg-[#131314]";

/**
 * The darker `#0f0f10` variant of `CARD_SURFACE_FILL_CLASSNAME` — the client
 * brand/requests card fill — for the brief form card and the brief summary cards.
 */
export const CARD_SURFACE_DARK_FILL_CLASSNAME = "border border-white/10 bg-[#0f0f10]";

export const CARD_SURFACE_CLASSNAME = `${CARD_SURFACE_FILL_CLASSNAME} p-4 text-white sm:p-6 md:p-8`;

/**
 * The brief form-phase card: fill + its own padding and vertical rhythm.
 * Shared by `ProjectBriefForm` and `ProjectBriefFormSkeleton` so the loading
 * placeholder cannot drift from the real card box. `mt-4` under the
 * header's `pb-3` is the same gap the preview phase uses below its `PageHeader`.
 */
export const BRIEF_FORM_CARD_CLASSNAME = `${CARD_SURFACE_DARK_FILL_CLASSNAME} mt-4 w-full rounded-xl p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8`;

/**
 * The plan card surface from `/app/plans` (`AppPlanCard`, Bit Start): a
 * bottom-left zinc-800 → black gradient with a hairline ring. Reused on the
 * brief summary's project tile and delivery-date row.
 */
export const PLAN_CARD_SURFACE_CLASSNAME =
  "bg-gradient-to-bl from-zinc-800 to-black ring-1 ring-white/10";
