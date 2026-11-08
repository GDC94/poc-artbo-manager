import { Suspense } from "react";

import { ParticipantFolderPage } from "@/components/app/documents/ParticipantFolderPage";
import { FOLDER_DEFS, SEED_FOLDER_KEYS } from "@/lib/files/folders";

/** Folders live in client-side data, so the page resolves them after hydration; opt out of the dev-only instant-shell check. */
export const instant = false;

/** Cache Components needs at least one sample param; any other slug renders on first request. */
export function generateStaticParams() {
  return SEED_FOLDER_KEYS.map((folder) => ({ folder }));
}

/** Labels of new folders only exist client-side, so unknown slugs get the generic title. */
export async function generateMetadata({ params }: PageProps<"/documentos/[folder]">) {
  const { folder } = await params;
  const known = FOLDER_DEFS.find((f) => f.key === folder);
  return { title: known ? `${known.label} · ARTBO` : "Carpeta · ARTBO" };
}

async function Folder({ params }: Pick<PageProps<"/documentos/[folder]">, "params">) {
  const { folder } = await params;
  return <ParticipantFolderPage folder={folder} />;
}

export default function FolderPage({ params }: PageProps<"/documentos/[folder]">) {
  return (
    <Suspense fallback={null}>
      <Folder params={params} />
    </Suspense>
  );
}
