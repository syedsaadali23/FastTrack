import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarRange, Trophy, Users2, Bell, ListChecks, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listEvents, getMyTeams, getNotifications } from "@/lib/services";
import type { Event, Team, NotificationsResponse } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateRange } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const colors = ["hsl(0 100% 17%)", "hsl(0 100% 22%)", "hsl(0 100% 27%)", "hsl(0 100% 32%)", "hsl(0 100% 37%)", "hsl(0 100% 42%)"];

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [notifs, setNotifs] = useState<NotificationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setError(null);
    try {
      const [ev, nt] = await Promise.all([listEvents(user.username), getNotifications(user.username)]);
      setEvents(ev);
      setNotifs(nt);
      if (user.role === "PLAYER") {
        const t = await getMyTeams(user.username);
        setTeams(t);
      } else setTeams([]);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  const stats = useMemo(() => {
    const e = events || [];
    return {
      total: e.length,
      ongoing: e.filter((x) => x.eventStatus === "Ongoing").length,
      upcoming: e.filter((x) => x.eventStatus === "Upcoming").length,
      registered: e.filter((x) => x.isRegistered).length,
    };
  }, [events]);

  const sportData = useMemo(() => {
    const m = new Map<string, number>();
    (events || []).forEach((e) => m.set(e.sport, (m.get(e.sport) || 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  const statusData = useMemo(() => {
    const m = new Map<string, number>();
    (events || []).forEach((e) => m.set(e.eventStatus || "Upcoming", (m.get(e.eventStatus || "Upcoming") || 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{error}</p>
        <button onClick={load} className="btn-outline">Retry</button>
      </div>
    );
  }

  const cards = [
    { label: "All Events", value: stats.total, icon: CalendarRange, color: "text-primary-light", bg: "bg-primary-light/10" },
    { label: "Ongoing", value: stats.ongoing, icon: Trophy, color: "text-accent-green-foreground", bg: "bg-accent-green border border-accent-green-foreground/20" },
    { label: "Upcoming", value: stats.upcoming, icon: ListChecks, color: "text-accent-gold-foreground", bg: "bg-accent-gold" },
    user?.role === "PLAYER"
      ? { label: "My Registrations", value: stats.registered, icon: ShieldCheck, color: "text-fss-orange", bg: "bg-fss-orange/10" }
      : { label: "Pending Approvals", value: notifs?.notifications.filter(n => n.isPending).length ?? 0, icon: Bell, color: "text-fss-orange", bg: "bg-fss-orange/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-10 max-w-7xl mx-auto px-4 py-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-8">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Stay updated with everything happening in FastTrack.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-border p-2 rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-primary">Live Events</p>
            <p className="text-xs text-muted-foreground font-medium">Active Tournaments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div 
            key={c.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-nuces group p-6 flex items-center justify-between hover:-translate-y-1 transition-all duration-300"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em]">{c.label}</p>
              <p className="text-3xl font-black text-primary tracking-tighter tabular-nums">{events ? c.value : "—"}</p>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${c.bg} group-hover:scale-110`}>
              <c.icon className={`h-6 w-6 ${c.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Events by sport</h2>
          {!events ? <Skeleton className="h-60" /> : sportData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sportData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary-light))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Status mix</h2>
          {!events ? <Skeleton className="h-60" /> : statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusData.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.name === 'Ongoing' ? 'hsl(var(--accent-green))' : entry.name === 'Upcoming' ? 'hsl(var(--accent-gold))' : colors[i % colors.length]} 
                        stroke={entry.name === 'Ongoing' ? 'hsl(var(--accent-green-foreground))' : 'none'} 
                        strokeWidth={1} 
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card-nuces p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-primary">Recent events</h2>
          <Link to="/events" className="text-sm text-primary-light hover:underline">View all</Link>
        </div>
        {!events ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 5).map((e) => (
              <Link key={e.id} to={`/events/${e.id}`} className="rounded-lg border border-border p-3 flex items-center justify-between hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{e.eventName}</p>
                  <p className="text-xs text-muted-foreground">{e.sport} · {formatDateRange(e.startDate, e.endDate)}</p>
                </div>
                <StatusBadge status={e.eventStatus} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {user?.role === "PLAYER" && (
        <div className="card-nuces p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-primary">My teams</h2>
            <Link to="/teams" className="text-sm text-primary-light hover:underline">Manage</Link>
          </div>
          {!teams ? <Skeleton className="h-12" /> : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">You aren't on any teams yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.slice(0, 6).map((t) => (
                <Link key={t.id} to={`/teams/${t.id}`} className="rounded-lg border border-border p-3 hover:bg-muted/50">
                  <p className="text-sm font-semibold text-primary truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.sport} · {t.members.length} member{t.members.length !== 1 ? "s" : ""}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}