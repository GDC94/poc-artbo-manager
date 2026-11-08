import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { ProfileForm } from "@/components/app/profile/ProfileForm";

export const metadata = { title: "Perfil · ARTBO" };

export default function ProfilePage() {
  return (
    <>
      <PageGreeting subtitle="¿Tienes alguna idea para hoy?" />
      <div className="mt-[33px]">
        <ProfileForm />
      </div>
    </>
  );
}
