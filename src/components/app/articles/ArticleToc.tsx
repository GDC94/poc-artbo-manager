"use client";

import { useEffect, useRef, useState } from "react";

import { pickActiveSection } from "@/lib/toc/active-section";
import { cn } from "@/lib/utils";

type Props = {
  sections: { id: string; heading: string }[];
};

/** Sticky "Tabla de contenido": highlights the section the reader is on. */
export function ArticleToc({ sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  // While a click-triggered scroll is running, keep the clicked item highlighted.
  const lockedRef = useRef(false);

  useEffect(() => {
    // The app shell scrolls inside <main>, not the window.
    const scroller = document.querySelector("main");
    if (!scroller) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (lockedRef.current) return;
      const scrollerTop = scroller.getBoundingClientRect().top;
      const tops = sections.map((section) => {
        const el = document.getElementById(section.id);
        return el ? el.getBoundingClientRect().top - scrollerTop : Number.POSITIVE_INFINITY;
      });
      const index = pickActiveSection(tops, scroller);
      if (index >= 0) setActiveId(sections[index].id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // A click lock lasts until the reader scrolls by hand again: near the end of the
    // article the clicked section may never reach the activation line on its own.
    const unlockAndUpdate = () => {
      lockedRef.current = false;
      schedule();
    };

    update();
    scroller.addEventListener("scroll", schedule, { passive: true });
    scroller.addEventListener("wheel", unlockAndUpdate, { passive: true });
    scroller.addEventListener("touchmove", unlockAndUpdate, { passive: true });
    window.addEventListener("keydown", unlockAndUpdate);
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      scroller.removeEventListener("wheel", unlockAndUpdate);
      scroller.removeEventListener("touchmove", unlockAndUpdate);
      window.removeEventListener("keydown", unlockAndUpdate);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  return (
    <nav
      aria-label="Tabla de contenido"
      className="rounded-xl border border-white/10 bg-[#0f0f10] p-4 sm:p-5 lg:sticky lg:top-4"
    >
      <p className="text-[17px] font-medium text-white underline underline-offset-4">Tabla de contenido</p>
      <ul className="mt-5 space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              onClick={() => {
                lockedRef.current = true;
                setActiveId(section.id);
              }}
              className={cn(
                "block text-[12px] font-medium leading-snug outline-none transition-colors focus-visible:underline",
                activeId === section.id ? "text-[#0071e3]" : "text-white hover:text-white/70",
              )}
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
