import { SupportCard } from "@/components/app/shared/SupportCard";
import { CONTACT_EMAIL } from "@/lib/mock/user";

/** The "¿Tienes dudas?" card of the right rail (Paper "Contact container"). */
export function ContactCard() {
  return (
    <SupportCard
      variant="light"
      title="¿Tienes dudas?"
      description="Escríbenos y pronto, nuestro equipo responderá tus preguntas."
      action={{ label: "Enviar Mail", href: `mailto:${CONTACT_EMAIL}` }}
    />
  );
}
