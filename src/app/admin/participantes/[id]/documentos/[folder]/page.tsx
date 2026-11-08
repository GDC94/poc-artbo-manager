import { Suspense } from "react";

import { ParticipantFolder } from "@/components/app/admin/ParticipantFolder";

export const metadata = { title: "Documentos del participante · ARTBO" };

export const instant = false;

async function Folder({ params }: Pick<PageProps<"/admin/participantes/[id]/documentos/[folder]">, "params">) {
  const { id, folder } = await params;
  return <ParticipantFolder id={id} folder={folder} />;
}

export default function ParticipantFolderPage({
  params,
}: PageProps<"/admin/participantes/[id]/documentos/[folder]">) {
  return (
    <>
      <Suspense fallback={null}>
        <Folder params={params} />
      </Suspense>
    </>
  );
}
