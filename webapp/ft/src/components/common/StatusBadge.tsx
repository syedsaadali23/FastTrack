import { cn, statusBadgeClass } from "@/lib/utils";

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  return <span className={cn(statusBadgeClass(status), className)}>{status || "Upcoming"}</span>;
}
