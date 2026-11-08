import { CcbLogo } from "@/components/brand/ccb-logo";

export function Footer() {
  return (
    <div className="border-t border-white/20 lg:mx-2">
      <div className="mx-auto flex w-full max-w-[1372px] flex-col items-center justify-center gap-3 py-6 text-center text-xs font-normal tracking-[-0.02em] text-[#eee] lg:h-[52px] lg:flex-row lg:justify-between lg:gap-2 lg:px-4 lg:py-0 lg:text-left min-[1404px]:px-0">
        <span>Cámara de Comercio de Bogotá - Artbo ®</span>
        <div className="flex items-center gap-1.5">
          <span>Un programa cultural de:</span>
          <CcbLogo className="h-[26px] w-[82px]" />
        </div>
      </div>
    </div>
  );
}
