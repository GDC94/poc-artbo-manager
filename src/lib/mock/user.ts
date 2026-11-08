export type MockUser = {
  /** Seeded participant this viewer is (there is no auth); drives which folders are visible. */
  participantId: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobFunction: string;
  jobTitle: string;
  email: string;
};

/** Fake participant. Nothing here is real. */
export const MOCK_USER: MockUser = {
  participantId: "p-01",
  firstName: "Sebastián",
  lastName: "Ramírez",
  phone: "57 300 123 4567",
  jobFunction: "design",
  jobTitle: "manager",
  email: "demo@artbo-intern.test",
};

export const MOCK_BRAND = {
  name: "Gymdoor",
  description: "Galería de arte contemporáneo con sede en Bogotá.",
};

export const CONTACT_EMAIL = "hola@artbo-intern.test";

export const JOB_FUNCTIONS = [
  { value: "marketing", label: "Marketing" },
  { value: "design", label: "Diseño" },
  { value: "engineering", label: "Ingeniería" },
  { value: "product", label: "Producto" },
  { value: "csuite", label: "Dirección general" },
  { value: "operations", label: "Operaciones" },
  { value: "other", label: "Otro" },
] as const;

export const JOB_TITLES = [
  { value: "director", label: "Director/a" },
  { value: "manager", label: "Gerente" },
  { value: "coordinator", label: "Coordinador/a" },
  { value: "analyst", label: "Analista" },
  { value: "other", label: "Otro" },
] as const;
