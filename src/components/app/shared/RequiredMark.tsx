/**
 * Red asterisk after a required field's label. Visual only (`aria-hidden`): the
 * field itself should carry `aria-required` where the control supports it.
 */
export function RequiredMark() {
  return (
    <span aria-hidden className="ml-0.5 text-destructive">
      *
    </span>
  );
}
