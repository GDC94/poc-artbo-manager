"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Geometry comes from Paper "02 · Support card" (Components artboard), snapped to
 * the Tailwind scale: 8px radius, 20px padding, 16px between the copy block and the
 * CTA, 8px title-to-description. Height follows the content — no fixed 157px.
 */
const supportCardVariants = cva("flex flex-col gap-5 rounded-[7px] px-[21px] pb-[18px] pt-[21px] text-white", {
  variants: {
    variant: {
      /** Light gray card of the Paper "¿Tienes dudas?" contact block. */
      light: "bg-[#eee] text-black",
      /** Apple Blue accent. */
      primary: "bg-primary",
      /** Neutral rail surface, #18181B. */
      dark: "bg-zinc-900",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

// On the Apple Blue fill a blue outline disappears, so that variant focuses in white.
const focusOutline: Record<SupportCardVariant, string> = {
  light: "focus-visible:outline-primary",
  primary: "focus-visible:outline-white",
  dark: "focus-visible:outline-primary",
};

export type SupportCardVariant = NonNullable<VariantProps<typeof supportCardVariants>["variant"]>;

export type SupportCardAction = {
  label: string;
} & (
  | {
      href: string;
      /** Opens the href in a new tab (off-app destinations such as YouTube). */
      external?: boolean;
      onClick?: never;
    }
  | { onClick: () => void; href?: never; external?: never }
);

type SupportCardProps = {
  variant?: SupportCardVariant;
  title: string;
  description: string;
  /** Omitted entirely when there's no CTA to show. */
  action?: SupportCardAction;
  /** Extra content rendered between the description and the call to action. */
  children?: ReactNode;
  className?: string;
};

/** Single support card for the 213px right rail. */
export function SupportCard({
  variant = "light",
  title,
  description,
  action,
  children,
  className,
}: SupportCardProps) {
  // Fill, height (h-8), type size (text-xs) and pill shape come from
  // <Button variant="secondary" size="sm" shape="pill">. DESIGN.md rule 10 asks for
  // a 2px outline instead of Button's 1px ring.
  const ctaVariant = variant === "light" ? "black" : "secondary";
  const ctaClassName = cn(
    "w-full font-bold",
    variant === "light" && "h-9 text-[13px]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-0",
    focusOutline[variant],
  );

  return (
    <div className={cn(supportCardVariants({ variant }), className)}>
      <div className="flex flex-col gap-[8px]">
        {/* Short titles stay on one line; long ones wrap into balanced lines. */}
        <h3
          className={cn(
            "text-balance font-normal leading-6",
            variant === "light" ? "text-[20px] font-medium leading-[23px]" : "text-xl",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-xs leading-4",
            variant === "light" && "text-[13px] font-normal leading-[17px]",
          )}
        >
          {description}
        </p>
      </div>

      {children}

      {action ? (
        action.href ? (
          <Button asChild variant={ctaVariant} size="sm" shape="pill" className={ctaClassName}>
            {action.external ? (
              <a href={action.href} target="_blank" rel="noopener noreferrer">
                {action.label}
              </a>
            ) : (
              <Link href={action.href}>{action.label}</Link>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant={ctaVariant}
            size="sm"
            shape="pill"
            className={ctaClassName}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
