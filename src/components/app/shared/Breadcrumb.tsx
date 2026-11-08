import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

/** Trail of links back to parent pages; the last item is the current page. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] leading-5">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.label} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight aria-hidden className="size-3.5 shrink-0 text-white/40" />
              ) : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-10 shrink-0 items-center rounded-sm text-white/60 lg:min-h-0 outline-none transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="truncate text-white">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
