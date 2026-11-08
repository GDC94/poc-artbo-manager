"use client";

import { FileText } from "lucide-react";

import { Citations, type CitationItem } from "@/components/agents/citations";

type Props = {
  sources: { title: string; href: string }[];
};

/** "Fuentes" block built on the BeUI Citations component (fake sources, no favicon requests). */
export function ArticleSources({ sources }: Props) {
  const items: CitationItem[] = sources.map((source, index) => ({
    id: `fuente-${index + 1}`,
    title: source.title,
    domain: new URL(source.href).hostname,
    url: source.href,
    // An explicit icon keeps the component from requesting remote favicons.
    icon: <FileText />,
  }));

  return <Citations citations={items} title="Fuentes" idPrefix="fuente" />;
}
