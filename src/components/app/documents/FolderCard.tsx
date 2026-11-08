import { FolderShape } from "@/components/app/shared/FolderShape";
import { cn } from "@/lib/utils";

/** Icon tile, shared by the folder card and the sheet header so they cannot drift. */
export const ICON_TILE_CLASSNAME =
  "grid size-9 place-items-center rounded-md border transition-colors duration-300";
export const ICON_TILE_FILLED_CLASSNAME =
  "bg-[#0071e3] border-[#0071e3] text-white shadow-[0_0_0_4px_rgba(0,113,227,0.12),0_8px_20px_-8px_rgba(0,113,227,0.8)]";
export const ICON_TILE_EMPTY_CLASSNAME =
  "bg-[#18181b] border-white/10 text-white/45 group-hover:border-[rgba(0,113,227,0.4)] group-hover:text-white/80 group-data-[open]:border-[rgba(0,113,227,0.4)] group-data-[open]:text-white/80";

type Props = React.ComponentPropsWithoutRef<"div"> & {
  icon: React.ReactNode;
  /** Top-right node (the "+" button). */
  action?: React.ReactNode;
  label: React.ReactNode;
  sublabel: React.ReactNode;
  /** The folder holds files: the icon tile turns solid blue. */
  filled?: boolean;
  /** The folder's sheet is open. */
  open?: boolean;
};

/**
 * A folder drawn by `FolderShape` as one SVG path behind the content. Fill and outline
 * come from `--folder-fill` / `--folder-stroke`, so callers tint it through those variables.
 */
export function FolderCard({
  icon,
  action,
  label,
  sublabel,
  filled = false,
  open = false,
  className,
  ...props
}: Props) {
  return (
    <div
      data-open={open ? "" : undefined}
      className={cn(
        "group relative isolate flex min-h-[132px] flex-col justify-between gap-4 rounded-[14px] px-3.5 pb-3.5 pt-[26px] text-left [--folder-fill:#0f0f10] [--folder-stroke:rgba(255,255,255,0.1)]",
        className,
      )}
      {...props}
    >
      <FolderShape />
      <div className="flex items-start justify-between">
        <span className="-mt-3 flex">
          <span
            className={cn(
              ICON_TILE_CLASSNAME,
              filled ? ICON_TILE_FILLED_CLASSNAME : ICON_TILE_EMPTY_CLASSNAME,
            )}
          >
            {icon}
          </span>
        </span>
        {action}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="break-words text-[15px] text-white">{label}</span>
        <span className="text-[13px] tabular-nums text-white/55 group-hover:text-white/80">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
