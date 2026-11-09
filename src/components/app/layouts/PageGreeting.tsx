"use client";

import type { ReactNode } from "react";

import { useViewer } from "@/lib/viewer/useViewer";

type Props = {
  subtitle: string;
  /** Defaults to the participant's first name; the admin area passes "Admin". */
  name?: string;
  /** Optional trail rendered above the greeting (e.g. a `<Breadcrumb />`). */
  breadcrumb?: ReactNode;
};

/** "Hola Valentina," block that opens every page, followed by the short rule. */
export function PageGreeting({ subtitle, name, breadcrumb }: Props) {
  const viewer = useViewer();
  const greeted = name ?? viewer.firstName;
  return (
    <header className="pt-5">
      {breadcrumb ? <div className="mb-5">{breadcrumb}</div> : null}
      <p className="text-2xl font-normal leading-8 text-white lg:text-[29.4px] lg:leading-[40px]">Hola {greeted},</p>
      <p className="text-[13px] leading-[18px] text-white lg:leading-[14px]">{subtitle}</p>
      <div className="mt-6 h-px lg:mt-[34px] w-6 bg-white" aria-hidden />
    </header>
  );
}
