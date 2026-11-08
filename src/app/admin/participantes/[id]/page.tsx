import { Suspense } from "react";

import { ParticipantDetail } from "@/components/app/admin/ParticipantDetail";

export const metadata = { title: "Participante · ARTBO" };

/** Participants live in the browser, so ids are resolved on the client; the route renders on demand. */
export const instant = false;

async function Detail({ params }: Pick<PageProps<"/admin/participantes/[id]">, "params">) {
  const { id } = await params;
  return <ParticipantDetail id={id} />;
}

export default function ParticipantPage({ params }: PageProps<"/admin/participantes/[id]">) {
  return (
    <>
      <Suspense fallback={null}>
        <Detail params={params} />
      </Suspense>
    </>
  );
}
