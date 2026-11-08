export interface VisibleChipCountInput {
  /** Natural (unshrunk) width of each chip, in order. */
  widths: number[];
  /** Width of the row the chips and the counter must share. */
  available: number;
  /** Flex gap between siblings. */
  gap: number;
  /** Width of the "+n" counter. */
  counterWidth: number;
}

/**
 * How many chips render at full width. When not all fit, room for the counter
 * (and one gap before it) is reserved. At least one chip always stays.
 */
export function visibleChipCount({
  widths,
  available,
  gap,
  counterWidth,
}: VisibleChipCountInput): number {
  if (widths.length === 0) return 0;

  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
  if (total <= available) return widths.length;

  let used = 0;
  let count = 0;
  for (let i = 0; i < widths.length; i += 1) {
    used += widths[i] + (i > 0 ? gap : 0);
    if (used + gap + counterWidth > available) break;
    count = i + 1;
  }
  return Math.max(1, count);
}
