import {
  LayoutDashboard, CalendarRange, Users2, Bell, UserCircle, Send,
  ShieldCheck, Search, ListChecks, Gamepad2, Trophy, Crosshair, BarChart3
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
    { to: "/events", label: "Browse Events", icon: CalendarRange, exact: true },
    { to: "/matches", label: "View Matches", icon: Gamepad2 },
    { to: "/formation-reports", label: "Team Formation Reports", icon: BarChart3 },
    { to: "/leaderboard", label: "View Leaderboard", icon: Trophy },
    { to: "/teams", label: "Team Formation", icon: Users2 },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell, exact: true },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  ORGANIZER: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/events", label: "Manage Events", icon: CalendarRange, exact: true },
    { to: "/events/new", label: "Create Event", icon: ListChecks },
    { to: "/matches", label: "View Matches", icon: Gamepad2 },
    { to: "/formation-reports", label: "Team Formation Reports", icon: BarChart3 },
    { to: "/leaderboard", label: "View Leaderboard", icon: Trophy },
    { to: "/notifications/send", label: "Send Notification", icon: Send },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell, exact: true },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
  ADMIN: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/events", label: "Manage Events", icon: CalendarRange, exact: true },
    { to: "/events/new", label: "Create Event", icon: ListChecks },
    { to: "/matches", label: "View Matches", icon: Gamepad2 },
    { to: "/formation-reports", label: "Team Formation Reports", icon: BarChart3 },
    { to: "/leaderboard", label: "View Leaderboard", icon: Trophy },
    { to: "/admin/approvals", label: "Pending Approvals", icon: ShieldCheck },
    { to: "/notifications/send", label: "Broadcast", icon: Send },
    { to: "/search", label: "Search", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell, exact: true },
    { to: "/profile", label: "Profile", icon: UserCircle },
  ],
};

export const guestNav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/login", label: "Login" },
];
