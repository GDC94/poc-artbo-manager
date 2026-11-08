"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { AdminCreateCard } from "./AdminCreateCard";
import { ContactCard } from "./ContactCard";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { isAdminPath, isParticipantFormPath } from "./nav";
import { Topbar } from "./Topbar";

/**
 * Three-column shell, same structure as bitworks' AppShell: sidebar | main | right rail.
 * Columns are the Paper widths: 213px rails, fluid main, 2px gutters, 1372px container.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close the mobile drawer on any navigation (links, back/forward). Adjusting state
  // during render is the React-endorsed alternative to a setState-in-effect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="app-grid mx-auto grid min-h-0 w-full max-w-[1372px] flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-x-[2px] px-4 pt-1.5 min-[1404px]:px-0 lg:grid-cols-[213px_minmax(0,1fr)] xl:grid-cols-[213px_minmax(0,1fr)_213px]">
        <header className="col-span-full row-start-1">
          <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        </header>

        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <main className="col-start-1 row-start-2 overflow-y-auto overflow-x-clip px-0 scrollbar-hide lg:px-5 lg:col-start-2">
          {/* Remounts per navigation so `.page-enter` fades the route in. */}
          <div key={pathname} className="page-enter pb-10">
            {children}
          </div>
          {/* Below lg the footer scrolls with the content instead of permanently eating viewport height. */}
          <footer className="lg:hidden">
            <Footer />
          </footer>
        </main>

        <aside className="row-start-2 hidden pt-[23px] xl:col-start-3 xl:block">
          {isAdminPath(pathname) && !isParticipantFormPath(pathname) ? <AdminCreateCard /> : <ContactCard />}
        </aside>
      </div>

      <footer className="hidden lg:block">
        <Footer />
      </footer>
    </div>
  );
}
