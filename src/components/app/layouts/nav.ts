import { Briefcase, CircleCheck, House, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Extra path prefixes that keep this item active (detail routes). */
  match: string[];
  section: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Información y fechas",
    href: "/",
    icon: Briefcase,
    match: ["/articulos"],
    section: "Organiza tu participación",
  },
  {
    label: "Documentos de ARTBO",
    href: "/documentos",
    icon: CircleCheck,
    match: ["/documentos"],
    section: "Organiza tu participación",
  },
  { label: "Perfil", href: "/perfil", icon: Briefcase, match: ["/perfil"], section: "Tu espacio" },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/admin",
    icon: House,
    match: ["/admin"],
    section: "Organiza tu participación",
  },
];

/** The admin area lives under `/admin`; everything else is the participant side. */
export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function getNavItems(pathname: string): NavItem[] {
  return isAdminPath(pathname) ? ADMIN_NAV_ITEMS : NAV_ITEMS;
}

/** Admin create/edit forms show the "¿Tienes dudas?" card instead of "Crea un nuevo perfil". */
export function isParticipantFormPath(pathname: string): boolean {
  return pathname === "/admin/participantes/nuevo" || /^\/admin\/participantes\/[^/]+\/editar$/.test(pathname);
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/" && pathname === "/") return true;
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
