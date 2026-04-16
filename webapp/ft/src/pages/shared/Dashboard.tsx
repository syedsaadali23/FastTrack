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

const colors = ["hsl(213 72% 32%)", "hsl(201 100% 43%)", "hsl(44 90% 49%)", "hsl(148 95% 28%)", "hsl(15 79% 51%)", "hsl(12 76% 33%)"];

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
    { label: "All Events", value: stats.total, icon: CalendarRange, color: "text-primary-light" },
    { label: "Ongoing", value: stats.ongoing, icon: Trophy, color: "text-accent-green" },
    { label: "Upcoming", value: stats.upcoming, icon: ListChecks, color: "text-accent-gold" },
    user?.role === "PLAYER"
      ? { label: "My Registrations", value: stats.registered, icon: ShieldCheck, color: "text-fss-orange" }
      : { label: "Pending Approvals", value: notifs?.notifications.filter(n => n.isPending).length ?? 0, icon: Bell, color: "text-fss-orange" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening across FastTrack today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card-nuces p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold text-primary">{events ? c.value : "—"}</p>
            </div>
            <c.icon className={`h-8 w-8 ${c.color}`} />
          </div>
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
                    {statusData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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
