import type { Participant, Requirement } from "@/lib/admin/types";
import { FOLDER_DEFS } from "@/lib/files/folders";

/** Fictional participants. Names, emails (.test) and phones are made up. */
export const SEED_PARTICIPANTS: Participant[] = [
  { id: "p-01", fullName: "Valentina Ospina Duarte", type: "Galería", event: "ARTBO Feria", email: "valentina@galeria-umbral.test", institution: "Galería Umbral", phone: "57 301 555 0101", city: "Bogotá", country: "Colombia" },
  { id: "p-02", fullName: "Andrés Felipe Caicedo", type: "Galería", event: "ARTBO Feria", email: "andres@arteviva.test", institution: "Arte Viva", phone: "57 302 555 0102", city: "Medellín", country: "Colombia" },
  { id: "p-03", fullName: "Mariana Restrepo Gil", type: "Institución", event: "Fin de Semana ARTBO", email: "mariana@museo-rio.test", institution: "Museo del Río", phone: "57 310 555 0103", city: "Cali", country: "Colombia" },
  { id: "p-04", fullName: "Camilo Barrera Vélez", type: "Editorial", event: "ARTBO Feria", email: "camilo@tintaycal.test", institution: "Editorial Tinta y Cal", phone: "57 311 555 0104", city: "Bogotá", country: "Colombia" },
  { id: "p-05", fullName: "Luciana Herrera Mejía", type: "Artista Artecámara", event: "Fin de Semana ARTBO", email: "luciana@estudio-herrera.test", institution: "Estudio Herrera", phone: "57 312 555 0105", city: "Cartagena", country: "Colombia" },
  { id: "p-06", fullName: "Sofía Montoya Arango", type: "Galería", event: "Fin de Semana ARTBO", email: "sofia@sala-norte.test", institution: "Sala Norte", phone: "57 313 555 0106", city: "Barranquilla", country: "Colombia" },
  { id: "p-07", fullName: "Julián Torres Pineda", type: "Institución", event: "ARTBO Feria", email: "julian@fundacion-alba.test", institution: "Fundación Alba", phone: "57 314 555 0107", city: "Bucaramanga", country: "Colombia" },
  { id: "p-08", fullName: "Daniela Vargas Soto", type: "Editorial", event: "Fin de Semana ARTBO", email: "daniela@papel-sur.test", institution: "Papel Sur Ediciones", phone: "57 315 555 0108", city: "Pereira", country: "Colombia" },
  { id: "p-09", fullName: "Esteban Quintero Lara", type: "Artista Artecámara", event: "ARTBO Feria", email: "esteban@quintero-taller.test", institution: "Taller Quintero", phone: "57 316 555 0109", city: "Manizales", country: "Colombia" },
  { id: "p-10", fullName: "Isabella Cárdenas Ruiz", type: "Galería", event: "ARTBO Feria", email: "isabella@casa-lumbre.test", institution: "Casa Lumbre", phone: "57 317 555 0110", city: "Bogotá", country: "Colombia" },
  { id: "p-11", fullName: "Tomás Echeverri Nieto", type: "Institución", event: "Fin de Semana ARTBO", email: "tomas@centro-faro.test", institution: "Centro Cultural Faro", phone: "57 318 555 0111", city: "Medellín", country: "Colombia" },
  { id: "p-12", fullName: "Paula Andrea Zapata", type: "Artista Artecámara", event: "Fin de Semana ARTBO", email: "paula@zapata-obra.test", institution: "Zapata Obra", phone: "57 319 555 0112", city: "Santa Marta", country: "Colombia" },
  { id: "p-13", fullName: "Nicolás Bermúdez Acosta", type: "Galería", event: "Fin de Semana ARTBO", email: "nicolas@galeria-cobre.test", institution: "Galería Cobre", phone: "57 320 555 0113", city: "Cúcuta", country: "Colombia" },
  { id: "p-14", fullName: "Gabriela Londoño Pardo", type: "Editorial", event: "ARTBO Feria", email: "gabriela@libros-aire.test", institution: "Libros al Aire", phone: "57 321 555 0114", city: "Cali", country: "Colombia" },
];

/** Starting catalog: one requirement per seed folder, id == folder key. */
export const SEED_REQUIREMENTS: Requirement[] = FOLDER_DEFS.map(({ key, label }) => ({
  id: key,
  label,
  active: true,
}));

export const SEED_SELECTIONS: Record<string, string[]> = {
  "p-01": ["imagenes", "logos", "guias-de-marca"],
  "p-03": ["ilustraciones", "tipografias"],
  "p-04": ["imagenes", "plantillas"],
  "p-10": ["logos", "iconos"],
};
