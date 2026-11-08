"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CopyButton } from "@/components/app/admin/CopyButton";
import { ParticipantDocuments } from "@/components/app/admin/ParticipantDocuments";
import { ParticipantNotFound } from "@/components/app/admin/ParticipantNotFound";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { Breadcrumb } from "@/components/app/shared/Breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs";
import { Button } from "@/components/ui/button";
import { getInitialsFromFullName } from "@/lib/admin/participants";
import { useAdmin } from "@/lib/admin/store";
import type { Participant } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type TabValue = "perfil" | "documentos";

/* Values from Paper J2-0: white bold 10px labels, light 29px headline values,
   medium 15px detail values, 14px copy icons. */
const LABEL = "text-[10px] font-bold leading-5 text-white";
const COPY = "relative size-6 rounded after:absolute after:-inset-2 after:content-[''] [&_svg]:size-3.5";

/** Headline field next to the avatar: copy icon right after the value. */
function HeadlineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className={LABEL}>{label}</p>
      <div className="flex items-start gap-2">
        <p className="truncate text-xl font-light leading-8 text-white lg:text-[29px] lg:leading-10">{value || "—"}</p>
        <CopyButton value={value} label={label} className={cn(COPY, "mt-1 lg:mt-1.5")} />
      </div>
    </div>
  );
}

/** Detail field: fixed-width cell so copy icons line up in vertical lanes. */
function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className={LABEL}>{label}</p>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[15px] font-medium leading-5 text-white">
          {value || "—"}
        </p>
        <CopyButton value={value} label={label} className={COPY} />
      </div>
    </div>
  );
}

function ProfileTab({ participant }: { participant: Participant }) {
  return (
    <div>
      {/* Avatar 82px, then Nombre | Tipo | Evento on one row (wraps on narrow screens). */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-9">
        <div
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-full bg-[#d9d9d9] text-2xl sm:size-[82px] sm:text-[28px] font-medium text-black"
        >
          {getInitialsFromFullName(participant.fullName)}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-y-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-x-10 sm:pt-3">
          <HeadlineField label="Nombre" value={participant.fullName} />
          <HeadlineField label="Tipo de participante" value={participant.type} />
          <HeadlineField label="Evento" value={participant.event} />
        </div>
      </div>

      {/* Two rows of up to three columns: 245px and 224px column pitch in Paper. */}
      <div className="mt-5 grid grid-cols-1 gap-x-[50px] gap-y-4 sm:grid-cols-2 md:grid-cols-[195px_174px_174px]">
        <DetailField label="Correo" value={participant.email} />
        <DetailField label="Nombre de la institución" value={participant.institution} />
        <div aria-hidden className="hidden md:block" />
        <DetailField label="Teléfono" value={participant.phone} />
        <DetailField label="Ciudad" value={participant.city} />
        <DetailField label="País" value={participant.country} />
      </div>

      <Button
        asChild
        variant="secondary"
        shape="pill"
        className="mt-8 h-11 w-full text-[12px] font-bold sm:w-[171px] lg:mt-9 lg:h-[33px]"
      >
        <Link href={`/admin/participantes/${participant.id}/editar`}>Editar perfil</Link>
      </Button>
    </div>
  );
}

/** Participant detail (Paper J2-0 / SC-0). The active tab lives in `?tab=` so it can be linked. */
export function ParticipantDetail({ id }: { id: string }) {
  const { participants, ready } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: TabValue =
    searchParams.get("tab") === "documentos" ? "documentos" : "perfil";
  const participant = participants.find((p) => p.id === id);

  if (!participant) return ready ? <ParticipantNotFound /> : null;

  const handleTabChange = (next: string) => {
    router.replace(
      next === "documentos" ? `${pathname}?tab=documentos` : pathname,
      { scroll: false },
    );
  };

  return (
    <>
      <PageGreeting
        name="Admin"
        subtitle="Gestiona todos los participantes de ARTBO Feria y Fin de Semana ARTBO"
        breadcrumb={
          <Breadcrumb items={[{ label: "Participantes", href: "/admin" }, { label: participant.fullName }]} />
        }
      />
      <div className="pt-6 lg:pt-7">
      <Tabs value={tab} onValueChange={handleTabChange} variant="underline">
        {/* Paper J2-0 layout (no side padding, 2px #0075F2 underline as wide as the
            label, 1px light gray divider), with the labels scaled up from 10px to 14px. */}
        <TabsList className="w-full gap-6 border-[#c2c2c2bf] sm:gap-9">
          {(["perfil", "documentos"] as const).map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              indicatorClassName="h-0.5 bg-[#0075F2]"
              className="min-h-10 px-0 pb-2 pt-0 text-[14px] lg:min-h-0 font-bold leading-6 text-white hover:text-white/70 aria-selected:text-[#0075F2]"
            >
              {value === "perfil" ? "Perfil" : "Documentos"}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="perfil" className="mt-4">
          {tab === "perfil" ? <ProfileTab participant={participant} /> : null}
        </TabsContent>
        <TabsContent value="documentos" className="mt-8">
          {tab === "documentos" ? (
            <ParticipantDocuments participant={participant} />
          ) : null}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
