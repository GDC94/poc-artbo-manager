/**
 * Keyboard navigation math for `MotionSelect`, kept out of the component so the
 * index arithmetic and the typeahead cycling can be tested without a DOM.
 *
 * Every function takes the enabled options **in DOM order** and the value the
 * keyboard currently sits on, and answers with the value it should move to, or
 * `null` when there is nowhere to go. None of them mutate their inputs.
 */

export type NavOption = { value: string; label: string };

export type NavTarget = "first" | "last" | "next" | "prev" | "selected";

/** Window, in ms, within which successive keystrokes build one typeahead query. */
export const TYPEAHEAD_RESET_MS = 500;

/**
 * The option a navigation key moves to.
 *
 * `from` is the active option, falling back to the selected one so the first
 * arrow press after opening continues from the current value rather than the
 * top. Both ends clamp instead of wrapping, matching the listbox pattern and
 * the native `<select>`: holding ArrowDown parks on the last option.
 */
export function nextActiveValue(
  options: NavOption[],
  from: string | null | undefined,
  to: NavTarget,
): string | null {
  if (options.length === 0) return null;
  const index = options.findIndex((option) => option.value === from);

  switch (to) {
    case "first":
      return options[0].value;
    case "last":
      return options[options.length - 1].value;
    case "selected":
      return index === -1 ? options[0].value : options[index].value;
    case "next":
      return options[Math.min(index + 1, options.length - 1)].value;
    case "prev":
      return index <= 0 ? options[0].value : options[index - 1].value;
  }
}

/**
 * The query a keystroke produces: it extends the previous one while the user
 * keeps typing, and starts over once {@link TYPEAHEAD_RESET_MS} has passed.
 */
export function nextTypeaheadQuery(
  previousQuery: string,
  previousAt: number,
  key: string,
  now: number,
): string {
  return now - previousAt > TYPEAHEAD_RESET_MS ? key : previousQuery + key;
}

/**
 * The option a typeahead query lands on, matching on the start of each label.
 *
 * Repeating one character cycles through the options sharing that initial
 * instead of re-matching the same one — pressing "b b b" walks the Bs, which is
 * what the listbox pattern prescribes and what a native `<select>` does. The
 * cycle resumes *after* the active option and wraps, so the last B leads back
 * to the first. Any other query is matched from the top of the list.
 *
 * Returns `null` when nothing matches, which leaves the caller's active option
 * where it was.
 */
export function typeaheadMatch(
  options: NavOption[],
  from: string | null | undefined,
  query: string,
): string | null {
  if (options.length === 0 || query === "") return null;

  const needle = query.toLowerCase();
  const cycling = needle.length > 1 && [...needle].every((char) => char === needle[0]);
  const search = cycling ? needle[0] : needle;

  let order = options;
  if (cycling) {
    const index = options.findIndex((option) => option.value === from);
    order = [...options.slice(index + 1), ...options.slice(0, index + 1)];
  }

  return order.find((option) => option.label.toLowerCase().startsWith(search))?.value ?? null;
}
