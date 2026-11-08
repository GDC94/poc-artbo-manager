export type ScrollMetrics = {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
};

/** Activation line, as a fraction of the visible height, while far from the end. */
const BASE_LINE = 0.2;

/**
 * Index of the section the reader is on, or -1 when there are no sections.
 *
 * `tops` are the section tops relative to the top of the visible scroll area. A
 * section is active once its top crosses the activation line. Trailing sections are
 * often too short to ever reach that line, so during the last screen of scroll the
 * line slides down to the bottom edge, letting every section take its turn.
 */
export function pickActiveSection(tops: readonly number[], metrics: ScrollMetrics): number {
  if (tops.length === 0) return -1;

  const { scrollTop, clientHeight, scrollHeight } = metrics;
  const base = clientHeight * BASE_LINE;
  const remaining = Math.max(0, scrollHeight - clientHeight - scrollTop);
  const progress = remaining < clientHeight ? 1 - remaining / clientHeight : 0;
  const line = base + (clientHeight - base) * progress;

  let active = 0;
  tops.forEach((top, index) => {
    if (top <= line) active = index;
  });
  return active;
}
