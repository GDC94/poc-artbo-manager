"use client";

import { useMemo, useState, type FormEvent } from "react";

import { CopyButton } from "@/components/app/admin/CopyButton";
import {
  MotionSelect,
  MotionSelectContent,
  MotionSelectItem,
  MotionSelectTrigger,
  MotionSelectValue,
} from "@/components/app/shared/MotionSelect";
import { Input } from "@/components/motion/input";
import { Button } from "@/components/ui/button";
import { PARTICIPANT_EVENTS, PARTICIPANT_TYPES, type ParticipantInput } from "@/lib/admin/types";
import {
  validateParticipantForm,
  type FormErrors,
  type ParticipantFormValues,
} from "@/lib/admin/validation";
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  initialValues: ParticipantFormValues;
  onSubmit: (input: ParticipantInput) => void;
};

/** Field styling that matches the dark inputs (BeUI Input defaults to a pill on transparent). */
const INPUT_CLASSNAMES = {
  field: "rounded-lg border-input bg-background",
  input: "text-base md:text-sm",
  label: "text-sm font-semibold text-white",
} as const;

const PLACEHOLDERS = {
  fullName: "Nombre y apellido",
  email: "nombre@correo.com",
  institution: "Nombre de la institución",
  city: "Ciudad",
  country: "País",
  password: "Mínimo 8 caracteres",
  confirmPassword: "Repite la contraseña",
} as const;

function SelectField({
  label,
  value,
  placeholder,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  error?: string;
  onChange: (value: string) => void;
}) {
  const labelId = `${label.replace(/\s+/g, "-").toLowerCase()}-label`;
  // No copy button here: it sat outside the trigger and made selects narrower
  // than the inputs, and the values are fixed options anyway.
  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="px-1 text-sm font-semibold text-white">
        {label}
      </span>
      <MotionSelect value={value} onValueChange={onChange}>
        <MotionSelectTrigger aria-labelledby={labelId} className={cn("h-11 w-full", error && "border-destructive")}>
          <MotionSelectValue placeholder={placeholder} />
        </MotionSelectTrigger>
        <MotionSelectContent>
          {options.map((option) => (
            <MotionSelectItem key={option} value={option}>
              {option}
            </MotionSelectItem>
          ))}
        </MotionSelectContent>
      </MotionSelect>
      <p className="min-h-4 px-1 text-xs text-destructive" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

/** Shared by "Edita este perfil" and "Creación de perfil". Passwords are validated, never stored. */
export function ParticipantForm({ mode, initialValues, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues);
  const [showErrors, setShowErrors] = useState(false);
  const errors: FormErrors = useMemo(() => validateParticipantForm(values, mode), [values, mode]);
  const visible = (field: keyof ParticipantFormValues) => (showErrors ? errors[field] : undefined);
  const set = <K extends keyof ParticipantFormValues>(field: K, value: ParticipantFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }));

  const textField = (
    field: "fullName" | "email" | "institution" | "city" | "country",
    label: string,
    type = "text",
  ) => (
    <Input
      label={label}
      type={type}
      value={values[field]}
      onChange={(next) => set(field, next)}
      placeholder={mode === "create" ? PLACEHOLDERS[field] : undefined}
      error={visible(field)}
      reserveErrorLine
      autoComplete="off"
      rightIcon={<CopyButton value={values[field]} label={label} />}
      classNames={INPUT_CLASSNAMES}
    />
  );

  const passwordField = (field: "password" | "confirmPassword", label: string) => (
    <Input
      label={label}
      type="password"
      value={values[field]}
      onChange={(next) => set(field, next)}
      placeholder={mode === "create" ? PLACEHOLDERS[field] : "Déjala vacía para conservarla"}
      error={visible(field)}
      reserveErrorLine
      autoComplete="new-password"
      rightIcon={<CopyButton value={values[field]} label={label} />}
      classNames={INPUT_CLASSNAMES}
    />
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0 || values.type === "" || values.event === "") return;
    onSubmit({
      fullName: values.fullName,
      type: values.type,
      event: values.event,
      email: values.email,
      institution: values.institution,
      // The form has no phone field (Paper); the caller keeps the stored one.
      phone: "",
      city: values.city,
      country: values.country,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      {/* Two equal columns; every field takes exactly one cell. */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
        {textField("fullName", "Nombre completo")}
        {textField("email", "Correo", "email")}
        <SelectField
          label="Tipo de participante"
          value={values.type}
          placeholder="Elige el tipo"
          options={PARTICIPANT_TYPES}
          error={visible("type")}
          onChange={(next) => set("type", next as ParticipantFormValues["type"])}
        />
        <SelectField
          label="Evento"
          value={values.event}
          placeholder="Elige el evento"
          options={PARTICIPANT_EVENTS}
          error={visible("event")}
          onChange={(next) => set("event", next as ParticipantFormValues["event"])}
        />
        {textField("institution", "Nombre de la institución")}
        {textField("city", "Ciudad")}
        {textField("country", "País")}
        {/* Keeps the two password fields side by side. */}
        <div aria-hidden className="hidden md:block" />
        {passwordField("password", "Contraseña del usuario")}
        {passwordField("confirmPassword", "Confirma la contraseña del usuario")}
      </div>
      <div className="pt-4">
        <Button type="submit" variant="secondary" shape="pill" size="2xl" className="w-full sm:w-[250px]">
          {mode === "create" ? "Crear nuevo perfil" : "Actualizar perfil"}
        </Button>
      </div>
    </form>
  );
}
