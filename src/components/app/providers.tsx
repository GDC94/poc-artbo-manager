"use client";

import { ToastProvider } from "@/components/app/shared/ToastProvider";
import { AdminProvider } from "@/lib/admin/store";
import { BrandProvider } from "@/lib/brand/store";
import { ProfileProvider } from "@/lib/profile/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProfileProvider>
        <BrandProvider>
          <AdminProvider>{children}</AdminProvider>
        </BrandProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}
