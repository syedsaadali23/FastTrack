import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d?: string) {
  if (!d) return "TBD";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

export function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return "TBD";
  if (start && end && start !== end) return `${formatDate(start)} – ${formatDate(end)}`;
  return formatDate(start || end);
}

export function statusBadgeClass(status?: string) {
  const s = (status || "Upcoming").toLowerCase();
  if (s === "ongoing") return "badge badge-ongoing";
  if (s === "completed") return "badge badge-completed";
  if (s === "cancelled") return "badge badge-cancelled";
  if (s === "postponed") return "badge badge-postponed";
  if (s === "paused") return "badge badge-paused";
  return "badge badge-upcoming";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function getErrorMessage(err: any, fallback = "Something went wrong") {
  return err?.response?.data?.message || err?.message || fallback;
}
