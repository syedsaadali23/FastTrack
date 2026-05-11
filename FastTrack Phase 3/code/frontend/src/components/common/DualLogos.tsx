import { cn } from "@/lib/utils";

interface Props {
  nucesHeight?: number;
  fssHeight?: number;
  showCross?: boolean;
  crossSize?: number;
  className?: string;
  /** Use "dark" when placed on the primary/dark background, "light" for cards/white backgrounds */
  variant?: "dark" | "light";
}

export function DualLogos({ nucesHeight = 36, fssHeight = 40, showCross = true, crossSize = 22, className, variant = "dark" }: Props) {
  const nucesSize = nucesHeight;
  const fssSize = fssHeight;

  return (
    <div className={cn("inline-flex items-center justify-center gap-3", className)}>
      {/* NUCES logo — circular clip + blend to remove white bg on dark surfaces */}
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: nucesSize, height: nucesSize }}
      >
        <img
          src="/images/nuces-logo.png"
          alt="FAST-NUCES"
          className="w-full h-full object-cover"
        />
      </div>

      {showCross ? (
        <span
          aria-hidden
          style={{ fontSize: crossSize, color: "hsl(var(--accent-gold))", lineHeight: 1, fontWeight: 800 }}
        >
          ×
        </span>
      ) : (
        <span aria-hidden className="block w-px self-stretch bg-primary-foreground/40" />
      )}

      {/* FSS logo — circular clip to remove dark square corners */}
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: fssSize, height: fssSize }}
      >
        <img
          src="/images/fss-logo.png"
          alt="Fast Lahore Sports Society"
          className="w-full h-full object-cover scale-[1.25]"
        />
      </div>
    </div>
  );
}
