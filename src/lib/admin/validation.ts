import { isParticipantEvent, isParticipantType, type ParticipantEvent, type ParticipantType } from "./types";

export type ParticipantFormValues = {
  fullName: string;
  type: ParticipantType | "";
  event: ParticipantEvent | "";
  email: string;
  institution: string;
  city: string;
  country: string;
  password: string;
  confirmPassword: string;
};

export const EMPTY_FORM: ParticipantFormValues = {
  fullName: "",
  type: "",
  event: "",
  email: "",
  institution: "",
  city: "",
  country: "",
  password: "",
  confirmPassword: "",
};

export type FormErrors = Partial<Record<keyof ParticipantFormValues, string>>;

export const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Passwords are only checked here; they are never stored. */
export function validateParticipantForm(values: ParticipantFormValues, mode: "create" | "edit"): FormErrors {
  const errors: FormErrors = {};
  if (!values.fullName.trim()) errors.fullName = "Escribe el nombre completo";
  if (!isParticipantType(values.type)) errors.type = "Elige el tipo de participante";
  if (!isParticipantEvent(values.event)) errors.event = "Elige el evento";
  if (!values.email.trim()) errors.email = "Escribe el correo";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Escribe un correo válido";

  const touched = values.password !== "" || values.confirmPassword !== "";
  if (mode === "create" || touched) {
    if (!values.password) errors.password = "Escribe una contraseña";
    else if (values.password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    if (values.password !== values.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
  }
  return errors;
}
