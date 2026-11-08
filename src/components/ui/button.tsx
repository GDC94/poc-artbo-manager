import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--apple-blue-hover)]",
        secondary: "bg-inverted text-inverted-foreground hover:bg-[#e5e5e5]",
        outline:
          "border border-input bg-transparent hover:border-white hover:bg-white hover:text-black",
        "outline-accent":
          "border border-link text-link bg-transparent hover:border-white hover:bg-white hover:text-black",
        ghost: "hover:bg-white/[0.06] hover:text-foreground",
        // Ghost teñido: misma ausencia de fill, pero el acento vive en el texto y en
        // un hover tenue. `destructive` es un fill rojo solido, que no sirve para una
        // accion de fila; `outline-accent` trae borde, que tampoco.
        "ghost-accent": "text-primary hover:bg-primary/10 hover:text-primary",
        "ghost-destructive": "text-muted-foreground hover:bg-destructive/15 hover:text-destructive",
        // Borde tenue que se aclara SIN invertir. `outline` invierte a blanco/negro
        // en hover a proposito (ver AGENTS.md), asi que es otro control.
        subtle: "border border-border bg-transparent text-foreground hover:bg-muted",
        // Opaque dark chip, never transparent: hover feedback is the border turning the
        // interactive accent, not a fill change (unlike `ghost`/`outline`). For a fixed
        // dark surface that needs to sit on top of anything, e.g. the sidebar consumption bubble.
        surface: "border border-white/10 bg-[#0a0a0b] text-white hover:border-primary",
        // Circulo neutro relleno, para una accion de icono en fila (p.ej. borrar en una
        // brand card): a diferencia de `ghost-destructive`, este arranca con fill visible
        // en reposo y solo se tine de rojo en hover.
        muted:
          "bg-muted text-foreground transition-colors duration-300 ease-out hover:bg-destructive/10 hover:text-destructive/80",
        // Pill neutro relleno para la accion secundaria junto a un CTA (p.ej. "Volver" en el
        // resumen del brief, Paper "Alineamos contigo"): fill solido sin borde, a diferencia de
        // `subtle`, y sin el hover rojo de `muted`.
        neutral: "bg-muted text-foreground hover:bg-white/[0.14]",
        // Fill negro solido para un CTA sobre una superficie clara (p.ej. el promo gris
        // "¿Necesitas un proyecto a la medida?"), donde `default` (azul) no es lo pedido.
        black: "bg-black text-white hover:bg-black/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Violeta de marca BitWorks (`bito-violet`), para CTAs de marca pedidos
        // explicitamente (p.ej. el banner "Crear proyecto" del admin).
        violet: "bg-bito-violet text-white hover:bg-bito-violet/90",
        link: "text-link underline-offset-4 hover:underline hover:scale-100 active:scale-100",
        // Deliberate exception to DESIGN.md's "violet is Bits-only" rule (apple-design-system.md
        // §0): the Figma "Chat con mensajes" spec calls out #5713F6 for the conversation
        // composer's send button specifically, not a generic CTA. Scoped to
        // ChatPanel `variant="conversation"` — do not reach for this fill elsewhere. Bakes in its
        // own 2px #0071e3 focus-visible outline (base only gives ring-1, see button/README.md).
        "chat-send":
          "bg-[#5713F6] text-white hover:bg-[#5713F6]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] focus-visible:ring-0",
        // The two fill-less icon controls of that same composer. `ghost` is not a
        // substitute: it declares no rest color (it would inherit the composer pill's
        // ambient one) and adds a hover fill the Figma spec does not have. Like
        // `chat-send`, both bake in the 2px #0071e3 focus outline the base only gives as ring-1.
        // `chat-icon` is the primary affordance (attach): white at rest, dimming on hover.
        "chat-icon":
          "text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] focus-visible:ring-0",
        // `chat-icon-muted` is the secondary pair (emoji, dictation): grey at rest, white on
        // hover, and Apple Blue while pressed — the mic uses `aria-pressed` for "listening".
        // The `aria-pressed:hover:` repeat is load-bearing: `hover` and `aria-pressed` are
        // independent variants, so without it the pressed mic would go white under the cursor.
        "chat-icon-muted":
          "text-[#A3A3A3] transition-colors hover:text-white aria-pressed:text-[#0071e3] aria-pressed:hover:text-[#0071e3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] focus-visible:ring-0",
        // Same color/scale as `link`, but the hover feedback is the left-to-right
        // `apple-underline-draw` animation (globals.css) instead of a static
        // underline — needs a `<span data-underline aria-hidden />` direct child.
        "link-draw": "text-link apple-underline-draw hover:scale-100 active:scale-100",
      },
      size: {
        xs: "h-7 px-3 text-[11px] [&_svg]:size-3.5",
        sm: "h-8 px-3 text-xs",
        // `sm` cuyo alto sigue al contenido y cuya etiqueta envuelve, para una accion
        // a ancho completo dentro de un popup angosto: la base es `whitespace-nowrap`
        // y de alto fijo, asi que un label largo se salia de la caja en vez de cortar.
        // `min-h-8` conserva la altura de `sm` cuando el label entra en una linea.
        "sm-wrap": "min-h-8 whitespace-normal px-3 py-1.5 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-8",
        xl: "h-11 px-6 text-[13px]",
        "2xl": "h-[53px] px-8 text-sm",
        icon: "h-9 w-9 p-0",
        "icon-xs": "h-6 w-6 p-0 [&_svg]:size-3.5",
        "icon-sm": "h-8 w-8 p-0",
        // 28px, between `icon-xs` (24px) and `icon-sm` (32px) — the emoji/dictation
        // controls of the chat composer (Figma "Chat con mensajes").
        "icon-28": "h-7 w-7 p-0",
        // 40px circular icon button — between `icon` (36px) and `icon-lg` (56px). Introduced for
        // the chat composer's send button (Figma "Chat con mensajes").
        "icon-md": "h-10 w-10 p-0",
        "icon-lg": "h-14 w-14 p-0 [&_svg]:size-6",
        link: "h-auto p-0",
      },
      // `shape` se declara ULTIMO a proposito: cva concatena en orden de declaracion, asi que
      // twMerge le da el grupo `rounded-*` a esta clase por encima de cualquier otra. Mantener
      // ese orden.
      shape: {
        default: "rounded-md",
        pill: "rounded-[980px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
