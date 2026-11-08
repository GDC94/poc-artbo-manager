"use client";

import { createContext, useContext, useMemo } from "react";

import { AlertCircle, Check } from "lucide-react";

import {
  AnimatedToastStack,
  useAnimatedToastStack,
  type ToastClassNames,
  type ToastStatus,
} from "@/components/motion/animated-toast-stack";

type Tone = "success" | "error";

/** Solid status badges: Apple Blue for success, system red for errors. */
const TOAST_ICONS: Partial<Record<ToastStatus, React.ReactNode>> = {
  success: <Check className="size-3.5" strokeWidth={3} aria-hidden />,
  error: <AlertCircle className="size-3.5" strokeWidth={2.5} aria-hidden />,
};

/**
 * Dark glass pill that matches the app chrome. The stack sits just below the
 * 51px top bar so it never covers the logo or the avatar menu.
 */
const TOAST_CLASSNAMES: ToastClassNames = {
  root: "top-[68px] w-[calc(100vw-2rem)] max-w-[380px]",
  surface:
    "rounded-[14px] border border-white/10 bg-[#1d1d1f]/90 py-2.5 pl-2.5 pr-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl",
  iconWrap:
    "size-6 [[data-status=success]_&]:bg-[#0071e3] [[data-status=success]_&]:text-white [[data-status=error]_&]:bg-[#ff3b30] [[data-status=error]_&]:text-white",
  title: "text-[14px] font-medium leading-5 tracking-[-0.01em] text-white",
  close: "size-6 text-white/45 hover:bg-white/10 hover:text-white",
};
type ToastContextValue = { toast: (message: string, tone?: Tone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Mounts BeUI's animated toast stack once and exposes `useToast()` to client components. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, showToast, dismissToast } = useAnimatedToastStack({
    defaultDuration: 3500,
    limit: 3,
  });

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (message, tone = "success") => {
        showToast({ title: message, status: tone });
      },
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-center"
        placement="fixed"
        portal
        maxVisible={3}
        icons={TOAST_ICONS}
        classNames={TOAST_CLASSNAMES}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
