import { Suspense } from "react";

import { ParticipantFormPage } from "@/components/app/admin/ParticipantFormPage";

export const metadata = { title: "Editar perfil · ARTBO" };

export const instant = false;

async function Edit({ params }: Pick<PageProps<"/admin/participantes/[id]/editar">, "params">) {
  const { id } = await params;
  return <ParticipantFormPage id={id} />;
}

export default function EditParticipantPage({ params }: PageProps<"/admin/participantes/[id]/editar">) {
  return (
    <>
      <Suspense fallback={null}>
        <Edit params={params} />
      </Suspense>
    </>
  );
}
