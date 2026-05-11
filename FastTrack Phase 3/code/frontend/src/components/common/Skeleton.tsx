import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%] animate-[shimmer_2s_infinite] shadow-inner",
        className
      )} 
    />
  );
}
