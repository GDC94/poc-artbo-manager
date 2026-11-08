import { notFound } from "next/navigation";

import { FolderWorkspace } from "@/components/app/documents/FolderWorkspace";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { FOLDER_KEYS, getFolderDef, isFolderKey } from "@/lib/files/folders";

/** All params are prerendered by `generateStaticParams`; opt out of the dev-only instant-shell check. */
export const instant = false;

export function generateStaticParams() {
  return FOLDER_KEYS.map((folder) => ({ folder }));
}

export async function generateMetadata({ params }: PageProps<"/documentos/[folder]">) {
  const { folder } = await params;
  return { title: isFolderKey(folder) ? `${getFolderDef(folder).label} · ARTBO` : "ARTBO" };
}

export default async function FolderPage({ params }: PageProps<"/documentos/[folder]">) {
  const { folder } = await params;
  if (!isFolderKey(folder)) notFound();

  return (
    <>
      <PageGreeting subtitle="¿Tienes alguna idea para hoy?" />
      <FolderWorkspace folder={folder} />
    </>
  );
}
