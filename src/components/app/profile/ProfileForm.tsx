"use client";

import { User } from "lucide-react";
import { useState } from "react";

import { CARD_SURFACE_CLASSNAME } from "@/components/app/shared/cardSurface";
import { FIELD_BOX_CLASSNAME } from "@/components/app/shared/fieldFocus";
import {
  MotionSelect,
  MotionSelectContent,
  MotionSelectItem,
  MotionSelectTrigger,
  MotionSelectValue,
} from "@/components/app/shared/MotionSelect";
import { Input as MotionInput } from "@/components/motion/input";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/app/shared/ToastProvider";
import { JOB_FUNCTIONS, JOB_TITLES } from "@/lib/mock/user";
import { getInitials } from "@/lib/profile/initials";
import { type Profile, useProfile } from "@/lib/profile/store";
import { cn } from "@/lib/utils";

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[13px] font-normal tracking-[-0.12px] text-white/60">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Section({
  label,
  children,
  centered = false,
}: {
  label: string;
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 py-6 md:grid-cols-[200px_1fr] md:gap-8",
        centered && "md:items-center",
      )}
    >
      <div
        className={cn(
          "text-base font-normal tracking-[-0.374px] text-white md:text-[17px]",
          !centered && "md:pt-1.5",
        )}
      >
        {label}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

const LINK_BUTTON = "min-h-10 text-xs lg:min-h-0";

/** Fake "change email / password" flow: a dialog that always succeeds. */
function ChangeDialog({
  trigger,
  title,
  description,
  fieldLabel,
  fieldType,
  confirmLabel,
  successMessage,
}: {
  trigger: string;
  title: string;
  description: string;
  fieldLabel: string;
  fieldType: "email" | "password";
  confirmLabel: string;
  successMessage: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const close = () => {
    setOpen(false);
    setValue("");
  };

  return (
    <>
      <Button type="button" variant="link-draw" size="link" className={LINK_BUTTON} onClick={() => setOpen(true)}>
        {trigger}
        <span data-underline aria-hidden />
      </Button>

      {/* BeUI Morphing Modal: `viewId` null closes it; Escape and backdrop call onClose. */}
      <MorphingModal
        viewId={open ? `change-${fieldType}` : null}
        onClose={close}
        placement="center"
        portal
        ariaLabel={title}
        className="max-w-[400px] border-white/10 bg-[#161617]"
      >
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim()) return;
            close();
            toast(successMessage);
          }}
        >
          <div className="space-y-1.5">
            <h2 className="text-xl font-medium tracking-[-0.01em] text-white">{title}</h2>
            <p className="text-[13px] leading-5 text-white/60">{description}</p>
          </div>
          <MotionInput
            label={fieldLabel}
            type={fieldType}
            value={value}
            onChange={setValue}
            autoFocus
            autoComplete={fieldType === "email" ? "off" : "new-password"}
            classNames={{ field: "rounded-lg border-input bg-background", label: "text-sm text-white" }}
          />
          <div className="flex flex-col gap-2">
            <Button type="submit" shape="pill" className="h-11 w-full" disabled={!value.trim()}>
              {confirmLabel}
            </Button>
            <Button type="button" variant="ghost" shape="pill" className="h-11 w-full" onClick={close}>
              Cancelar
            </Button>
          </div>
        </form>
      </MorphingModal>
    </>
  );
}

function ProfileFormFields({ initial }: { initial: Profile }) {
  const { saveProfile } = useProfile();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Profile>(initial);
  const patch = (changes: Partial<Profile>) => setDraft((current) => ({ ...current, ...changes }));

  const canSave = draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;
  const initials = getInitials(draft.firstName, draft.lastName);

  function handleSave() {
    const ok = saveProfile({
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      phone: draft.phone.trim(),
    });
    toast(ok ? "Perfil guardado" : "No se pudo guardar en este navegador", ok ? "success" : "error");
  }

  return (
    <div className={cn("rounded-lg", CARD_SURFACE_CLASSNAME, "bg-[#0f0f10]")}>
      <h2 className="text-2xl font-light sm:text-3xl">Perfil</h2>

      <div className="divide-y divide-white/10">
        <Section label="Información de usuario">
          {/* The avatar is always the user's initials; there is no image upload. */}
          <div
            aria-hidden
            className="grid h-14 w-14 place-items-center rounded-full bg-zinc-700 text-lg text-zinc-300"
          >
            {initials || <User className="h-6 w-6" />}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="first_name">
              <Input
                id="first_name"
                value={draft.firstName}
                maxLength={50}
                onChange={(e) => patch({ firstName: e.target.value })}
                className={FIELD_BOX_CLASSNAME}
              />
            </Field>
            <Field label="Apellido" htmlFor="last_name">
              <Input
                id="last_name"
                value={draft.lastName}
                maxLength={50}
                onChange={(e) => patch({ lastName: e.target.value })}
                className={FIELD_BOX_CLASSNAME}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={draft.phone}
                maxLength={20}
                // Letters never reach state: only digits and phone punctuation.
                onChange={(e) => patch({ phone: e.target.value.replace(/[^\d\s()+\-.]/g, "") })}
                className={FIELD_BOX_CLASSNAME}
              />
            </Field>
          </div>
        </Section>

        <Section label="Rol">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Función">
              <MotionSelect value={draft.jobFunction} onValueChange={(v) => patch({ jobFunction: v })}>
                <MotionSelectTrigger className={FIELD_BOX_CLASSNAME}>
                  <MotionSelectValue placeholder="Selecciona una función" />
                </MotionSelectTrigger>
                <MotionSelectContent>
                  {JOB_FUNCTIONS.map((o) => (
                    <MotionSelectItem key={o.value} value={o.value}>
                      {o.label}
                    </MotionSelectItem>
                  ))}
                </MotionSelectContent>
              </MotionSelect>
            </Field>
            <Field label="Cargo">
              <MotionSelect value={draft.jobTitle} onValueChange={(v) => patch({ jobTitle: v })}>
                <MotionSelectTrigger className={FIELD_BOX_CLASSNAME}>
                  <MotionSelectValue placeholder="Selecciona un cargo" />
                </MotionSelectTrigger>
                <MotionSelectContent>
                  {JOB_TITLES.map((o) => (
                    <MotionSelectItem key={o.value} value={o.value}>
                      {o.label}
                    </MotionSelectItem>
                  ))}
                </MotionSelectContent>
              </MotionSelect>
            </Field>
          </div>
        </Section>

        <Section label="Email" centered>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="min-w-0 break-all text-sm text-white">{draft.email}</span>
            <ChangeDialog
              trigger="Cambiar"
              title="Cambiar email"
              description="Te enviaremos un correo para confirmar tu nueva dirección. Es una demostración: no se envía nada."
              fieldLabel="Nuevo email"
              fieldType="email"
              confirmLabel="Enviar confirmación"
              successMessage="Listo. Revisa tu correo para confirmar el cambio (demo)"
            />
          </div>
        </Section>

        <Section label="Contraseña" centered>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="select-none text-sm text-white" aria-hidden>
              ••••••••••••
            </span>
            <ChangeDialog
              trigger="Cambiar"
              title="Cambiar contraseña"
              description="Elige una nueva contraseña. Es una demostración: no se guarda en ningún lado."
              fieldLabel="Nueva contraseña"
              fieldType="password"
              confirmLabel="Actualizar contraseña"
              successMessage="Contraseña actualizada (demo)"
            />
          </div>
        </Section>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="h-11 w-full rounded-full px-8 sm:w-auto"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}

/** Profile card. Seeds its draft once the stored profile has been read (see `key`). */
export function ProfileForm() {
  const { profile, ready } = useProfile();
  return <ProfileFormFields key={ready ? "ready" : "loading"} initial={profile} />;
}
