import { SupportCard } from "@/components/app/shared/SupportCard";

/** The "Crea un nuevo perfil" card of the admin right rail (Paper E0-0). */
export function AdminCreateCard() {
  return (
    <SupportCard
      variant="dark"
      title="Crea un nuevo perfil"
      description="Si llegó alguien nuevo al equipo, créale un perfil e intégralo dentro de ARTBO."
      action={{ label: "Crear nuevo perfil", href: "/admin/participantes/nuevo" }}
    />
  );
}
