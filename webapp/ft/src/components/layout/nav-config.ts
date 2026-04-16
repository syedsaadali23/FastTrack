import {
  LayoutDashboard, CalendarRange, Users2, Bell, UserCircle, Send,
  ShieldCheck, Search, ListChecks,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export const sidebarNav: Record<Role, NavItem[]> = {
  PLAYER: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/events", label: "Browse Events", icon: CalendarRange },
    { to: "/teams", label: "My Teams", icon: Users2 },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  ORGANIZER: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/events", label: "Manage Events", icon: CalendarRange },
    { to: "/events/new", label: "Create Event", icon: ListChecks },
    { to: "/notifications/send", label: "Send Notification", icon: Send },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  ADMIN: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/events", label: "Manage Events", icon: CalendarRange },
    { to: "/events/new", label: "Create Event", icon: ListChecks },
    { to: "/admin/approvals", label: "Pending Approvals", icon: ShieldCheck },
    { to: "/notifications/send", label: "Broadcast", icon: Send },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
};

export const guestNav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/login", label: "Login" },
];
