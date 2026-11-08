import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { BrandForm } from "@/components/app/documents/BrandForm";

export const metadata = { title: "Documentos de ARTBO · ARTBO" };

export default function DocumentsPage() {
  return (
    <>
      <PageGreeting subtitle="¿Tienes alguna idea para hoy?" />
      <h1 className="pt-6 text-2xl font-medium sm:text-3xl lg:pt-7 text-white">Cuéntanos sobre tu marca</h1>
      <div className="mt-[27px]">
        <BrandForm />
      </div>
    </>
  );
}
