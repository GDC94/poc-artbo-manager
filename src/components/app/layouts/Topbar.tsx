"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, Menu } from "lucide-react";

import { ArtboLogo } from "@/components/brand/artbo-logo";
import { Popover } from "@/components/ui/popover";
import { getInitials } from "@/lib/profile/initials";
import { useProfile } from "@/lib/profile/store";
import { cn } from "@/lib/utils";
import { isAdminPath } from "./nav";

type Props = {
  onMenuToggle: VoidFunction;
};

const VIEWS = [
  { label: "Vista participante", href: "/", admin: false },
  { label: "Vista administrador", href: "/admin", admin: true },
] as const;

export function Topbar({ onMenuToggle }: Props) {
  const { profile } = useProfile();
  const pathname = usePathname();
  const admin = isAdminPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = admin ? "AD" : getInitials(profile.firstName, profile.lastName) || "?";

  return (
    <div className="apple-glass flex h-[51px] w-full items-center justify-between rounded-[7px] pl-2 pr-3 lg:pl-4 lg:pr-[11px]">
      <div className="flex min-w-0 items-center gap-1 lg:gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menú"
          className="grid size-10 place-items-center rounded-md hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <Link href={admin ? "/admin" : "/"} aria-label="ARTBO, inicio" className="flex items-center">
          <ArtboLogo className="h-[35px] w-[125px] shrink-0" />
        </Link>
      </div>
      <Popover
        open={menuOpen}
        onOpenChange={setMenuOpen}
        align="end"
        className="w-[212px] p-1.5"
        trigger={
          <button
            type="button"
            aria-label="Cambiar de vista"
            className="relative grid size-10 place-items-center lg:size-[34px] overflow-hidden rounded-full bg-white text-xs font-medium text-black outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
          >
            {initials}
          </button>
        }
      >
        <nav aria-label="Vistas" className="flex flex-col">
          {VIEWS.map((view) => {
            const current = view.admin === admin;
            return (
              <Link
                key={view.href}
                href={view.href}
                onClick={() => setMenuOpen(false)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-2 text-[13px] text-white outline-none transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.08]",
                  current && "font-medium",
                )}
              >
                {view.label}
                {current ? <Check className="size-3.5 text-[#0071e3]" aria-hidden /> : null}
              </Link>
            );
          })}
          {!admin ? (
            <Link
              href="/perfil"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2.5 py-2 text-[13px] text-white/70 outline-none transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:bg-white/[0.08]"
            >
              Mi perfil
            </Link>
          ) : null}
        </nav>
      </Popover>
    </div>
  );
}
