"use client";

import { useRouter } from "next/navigation";

import { ParticipantForm } from "@/components/app/admin/ParticipantForm";
import { ParticipantNotFound } from "@/components/app/admin/ParticipantNotFound";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { Breadcrumb } from "@/components/app/shared/Breadcrumb";
import { useToast } from "@/components/app/shared/ToastProvider";
import { useAdmin } from "@/lib/admin/store";
import { EMPTY_FORM, type ParticipantFormValues } from "@/lib/admin/validation";

/** "Creación de perfil" (no `id`) and "Edita este perfil" (with `id`). */
export function ParticipantFormPage({ id }: { id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { participants, ready, createParticipant, updateParticipant } = useAdmin();
  const participant = id ? participants.find((p) => p.id === id) : undefined;

  if (id && !participant) return ready ? <ParticipantNotFound /> : null;

  const initialValues: ParticipantFormValues = participant
    ? {
        ...EMPTY_FORM,
        fullName: participant.fullName,
        type: participant.type,
        event: participant.event,
        email: participant.email,
        institution: participant.institution,
        city: participant.city,
        country: participant.country,
      }
    : EMPTY_FORM;

  return (
    <>
    <PageGreeting
      name="Admin"
      subtitle={participant ? "Actualiza la información de este participante" : "Crea el perfil de un nuevo participante"}
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Participantes", href: "/admin" },
            ...(participant
              ? [
                  { label: participant.fullName, href: `/admin/participantes/${participant.id}` },
                  { label: "Editar" },
                ]
              : [{ label: "Nuevo perfil" }]),
          ]}
        />
      }
    />
    <div className="space-y-6 pt-6 lg:pt-7">
      <h1 className="text-2xl font-medium text-white sm:text-3xl">
        {participant ? "Edita este perfil" : "Creación de perfil"}
      </h1>
      <ParticipantForm
        // Remount once the stored copy is read so the form seeds from the saved values.
        key={ready ? "ready" : "loading"}
        mode={participant ? "edit" : "create"}
        initialValues={initialValues}
        onSubmit={(input) => {
          if (participant) {
            updateParticipant(participant.id, { ...input, phone: participant.phone });
            toast("Perfil actualizado");
            router.push(`/admin/participantes/${participant.id}`);
          } else {
            const newId = createParticipant(input);
            toast("Perfil creado");
            router.push(`/admin/participantes/${newId}`);
          }
        }}
      />
    </div>
    </>
  );
}
