"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { HoverHighlight } from "@/components/app/shared/HoverHighlight";
import { ArtboLogo } from "@/components/brand/artbo-logo";
import { cn } from "@/lib/utils";
import { getNavItems, isAdminPath, isNavItemActive } from "./nav";

type Props = {
  open: boolean;
  onClose: VoidFunction;
};

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const items = getNavItems(pathname);
  const layoutId = `sidebar-highlight-${useId()}`;
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Mobile drawer behavior: Escape closes, body scroll is locked, focus moves into it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] flex-col border-r border-white/10 bg-background px-4 transition-[transform,visibility] duration-200 lg:static lg:col-start-1 lg:border-r-0 lg:row-start-2 lg:w-auto lg:translate-x-0 lg:px-0",
          open ? "visible translate-x-0" : "invisible -translate-x-full lg:visible",
        )}
      >
        <div className="flex h-14 items-center justify-between lg:hidden">
          <Link href={isAdminPath(pathname) ? "/admin" : "/"} onClick={onClose} aria-label="Inicio">
            <ArtboLogo className="h-5 w-auto" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="grid size-10 place-items-center rounded-md hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <motion.nav
          layoutScroll
          aria-label="Principal"
          onMouseLeave={() => setHoveredHref(null)}
          className="flex-1 space-y-0.5 overflow-y-auto pt-[21px] pb-3"
        >
          {items.map((item, index) => {
            const showSection = index === 0 || items[index - 1].section !== item.section;
            const isFirstSection = index === 0;
            const active = isNavItemActive(pathname, item);
            const Icon = item.icon;
            return (
              <Fragment key={item.href}>
                {showSection ? (
                  <div
                    className={cn(
                      "mb-1 h-5 truncate text-[13px] font-bold leading-5 text-[#d2d2d2]",
                      !isFirstSection && "mt-[21px]",
                    )}
                  >
                    {item.section}
                  </div>
                ) : null}
                <Link
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative isolate flex h-11 items-center gap-2.5 whitespace-nowrap rounded px-2.5 text-sm font-normal lg:h-[29px] lg:text-xs leading-5 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-[#0071e3]",
                    active ? "bg-white text-black" : "bg-[#18181b] text-white",
                  )}
                >
                  <HoverHighlight
                    layoutId={layoutId}
                    isListHovered={hoveredHref !== null}
                    isHovered={hoveredHref === item.href}
                    className="rounded bg-white/[0.06]"
                  />
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              </Fragment>
            );
          })}
        </motion.nav>
      </aside>
    </>
  );
}
