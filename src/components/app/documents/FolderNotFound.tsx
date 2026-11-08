import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FolderNotFound({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-col items-start gap-4 pt-10">
      <p className="text-xl font-medium sm:text-2xl text-white">No encontramos esta carpeta</p>
      <p className="text-sm text-white/70">Puede que no esté habilitada para ti o que ya no exista.</p>
      <Button asChild variant="secondary" shape="pill" size="xl">
        <Link href={backHref}>Volver a Documentos</Link>
      </Button>
    </div>
  );
}
