import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { DualLogos } from "@/components/common/DualLogos";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/common/NotificationBell";

const guestLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block rounded-full overflow-hidden flex-shrink-0 w-8 h-8">
            <img src="/images/nuces-logo.png" alt="NUCES" className="w-full h-full object-cover" />
          </div>
          <span aria-hidden className="hidden sm:block w-px h-7 bg-primary-foreground/40" />
          <div className="rounded-full overflow-hidden flex-shrink-0 w-9 h-9">
            <img src="/images/fss-logo.png" alt="FSS" className="w-full h-full object-cover scale-[1.25]" />
          </div>
          <span className="text-xl font-bold text-primary-foreground truncate">FastTrack</span>
        </Link>

        {!user && (
          <nav className="hidden md:flex items-center gap-6">
            {guestLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) =>
                  `text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground py-5 ${isActive ? "nav-active" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="btn-ghost text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">Login</Link>
              <Link to="/signup" className="btn-primary-light">Sign Up</Link>
            </>
          ) : (
            <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/15 pl-1 pr-3 py-1 text-primary-foreground"
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="h-7 w-7 rounded-full bg-primary-light text-white text-xs font-semibold flex items-center justify-center">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
                      <UserCircle className="h-4 w-4" /> Profile
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          aria-label="Open menu"
          className="md:hidden p-2 text-primary-foreground"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10">
          <div className="px-4 py-3 flex flex-col gap-2">
            {!user ? (
              <>
                {guestLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} end onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">
                    {l.label}
                  </NavLink>
                ))}
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Login</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary-light flex-1">Sign Up</Link>
                </div>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">Dashboard</Link>
                <Link to="/events" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">Events</Link>
                {user.role === "PLAYER" && (
                  <Link to="/teams" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">My Teams</Link>
                )}
                <Link to="/notifications" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">Notifications</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-primary-foreground/90">Profile</Link>
                <button onClick={handleLogout} className="text-left px-2 py-2 text-sm text-red-300">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
