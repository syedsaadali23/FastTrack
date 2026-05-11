import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className="group block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? "bg-white/20" : "bg-transparent group-hover:bg-sidebar-primary/10"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{label}</span>
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className="h-1.5 w-1.5 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(255,191,0,0.6)]"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border/50 p-4 space-y-4">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-primary/10 border border-sidebar-border/30">
          <div className="relative">
            {user.profilePicture ? (
              <img src={user.profilePicture} className="h-10 w-10 rounded-xl object-cover ring-2 ring-sidebar-primary/20" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center text-sm font-bold shadow-inner">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-sidebar ring-1 ring-green-500/50" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate tracking-tight">{user.name}</p>
            <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest">{user.role}</p>
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
