import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Calendar, Users2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { listEvents } from "@/lib/services";
import type { Event } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDateRange, getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/common/Input";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const load = async () => {
    if (!user) return;
    setError(null);
    try { setEvents(await listEvents(user.username)); }
    catch (e) { setError(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  const filtered = useMemo(() => {
    let arr = events || [];
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter((e) => e.eventName.toLowerCase().includes(s) || e.sport.toLowerCase().includes(s));
    }
    if (statusFilter !== "All") arr = arr.filter((e) => (e.eventStatus || "Upcoming") === statusFilter);
    return arr;
  }, [events, q, statusFilter]);

  const statuses = ["All", "Upcoming", "Ongoing", "Postponed", "Paused", "Completed", "Cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Events</h1>
          <p className="text-sm text-muted-foreground">{user?.role === "PLAYER" ? "Browse and register for tournaments" : "Manage all tournaments"}</p>
        </div>
        {(user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
          <Link to="/events/new" className="btn-primary-light"><Plus className="h-4 w-4" /> New event</Link>
        )}
      </div>

      <div className="card-nuces p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <Input placeholder="Search events or sports…" value={q} onChange={(e) => setQ(e.target.value)} rightSlot={<Search className="h-4 w-4 text-muted-foreground" />} />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1.5 rounded-full border ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card-nuces p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="btn-outline">Retry</button>
        </div>
      )}

      {!events ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No events found"
          description={(events.length === 0) ? "There are no events yet. Check back soon." : "Try clearing filters or another search term."}
          action={(user?.role === "ORGANIZER" || user?.role === "ADMIN") ? <Link to="/events/new" className="btn-primary-light">Create the first event</Link> : null}
        />
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-nuces p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-primary-light font-semibold uppercase tracking-wide">{e.sport}</span>
                <StatusBadge status={e.eventStatus} />
              </div>
              <h3 className="text-lg font-semibold text-primary mt-1 line-clamp-2">{e.eventName}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2"><Calendar className="h-3.5 w-3.5" /> {formatDateRange(e.startDate, e.endDate)}</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1"><Users2 className="h-3.5 w-3.5" /> {(e.totalSlots ?? 0) - (e.availableSlots ?? 0)}/{e.totalSlots ?? 0} registered</div>
              <div className="flex items-center gap-2 mt-3">
                {e.isRegistrationOpen && <span className="badge badge-gold">Open</span>}
                {e.isTeamSport && <span className="badge badge-fss">Team</span>}
                {e.isRegistered && <span className="badge badge-ongoing">You're in</span>}
              </div>
              <Link to={`/events/${e.id}`} className="btn-primary-light mt-auto pt-2.5 w-full mt-4">View details</Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
