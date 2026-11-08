import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ParticipantNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 pt-10">
      <p className="text-xl font-medium sm:text-2xl text-white">No encontramos a este participante</p>
      <p className="text-sm text-white/70">Puede que el perfil ya no exista en este navegador.</p>
      <Button asChild variant="secondary" shape="pill" size="xl">
        <Link href="/admin">Volver a Participantes</Link>
      </Button>
    </div>
  );
}
