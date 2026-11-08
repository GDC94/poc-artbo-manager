/**
 * Outline of the folder card as ONE closed path: a rounded body with a
 * slanted tab on the top-left, sized to `w` x `h` and inset by half the
 * stroke width so a 1px stroke stays fully inside the box.
 */
export function folderPath(w: number, h: number) {
  const T = 14,
    r = 14,
    tr = 10;
  const x0 = 0.5,
    y0 = 0.5,
    x1 = w - 0.5,
    y1 = h - 0.5,
    yb = T + 0.5;
  return `M${x0} ${y0 + tr} A${tr} ${tr} 0 0 1 ${x0 + tr} ${y0} H96 C100 ${y0} 101.5 1.6 103.4 4 L108.6 ${T - 3.5} C110.4 ${T - 1} 112 ${yb} 115.5 ${yb} H${x1 - r} A${r} ${r} 0 0 1 ${x1} ${yb + r} V${y1 - r} A${r} ${r} 0 0 1 ${x1 - r} ${y1} H${x0 + r} A${r} ${r} 0 0 1 ${x0} ${y1 - r} Z`;
}
