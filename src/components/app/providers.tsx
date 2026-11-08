"use client";

import { ToastProvider } from "@/components/app/shared/ToastProvider";
import { AdminProvider } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";
import { FilesProvider } from "@/lib/files/store";
import { ProfileProvider } from "@/lib/profile/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProfileProvider>
        <BrandProvider>
          <FilesProvider>
            <AdminProvider>{children}</AdminProvider>
          </FilesProvider>
        </BrandProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}
