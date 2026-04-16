import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { sidebarNav } from "./nav-config";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;
  const items = sidebarNav[user.role];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2">
        <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
          <img src="/images/nuces-logo.png" alt="NUCES" className="w-full h-full object-cover" />
        </div>
        <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
          <img src="/images/fss-logo.png" alt="FSS" className="w-full h-full object-cover scale-[1.25]" />
        </div>
        <span className="text-sm font-bold">FastTrack</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "sidebar-item-active"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          {user.profilePicture ? (
            <img src={user.profilePicture} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sm font-semibold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user.role}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-sidebar-accent hover:opacity-90"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
        <div className="flex items-center justify-center gap-2 pt-2">
          <p className="text-[10px] text-sidebar-foreground/50">Powered by FSS</p>
          <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
            <img src="/images/fss-logo.png" alt="FSS" className="w-full h-full object-cover scale-[1.25]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
