import type { Metadata } from "next";

import { AppShell } from "@/components/app/layouts/AppShell";
import { Providers } from "@/components/app/providers";
import { helveticaNeue } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARTBO · Área privada del participante",
  description: "Espacio privado de demostración para participantes de ARTBO.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="apple" className={`${helveticaNeue.variable} h-full antialiased`}>
      <body className="h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
