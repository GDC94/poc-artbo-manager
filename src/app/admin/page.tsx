import { AdminHome } from "@/components/app/admin/AdminHome";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";

export const metadata = { title: "Administración · ARTBO" };

export default function AdminPage() {
  return (
    <>
      <PageGreeting
        name="Admin"
        subtitle="Gestiona todos los participantes de ARTBO Feria y Fin de Semana ARTBO"
      />
      <AdminHome />
    </>
  );
}
