import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users2, DollarSign, Clock, Trophy, Play, Pause, Trash2, CalendarClock, Power } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  listEvents, registerForEvent, cancelEventRegistration, toggleEventRegistration,
  startEvent, pauseEvent, postponeEvent, deleteEvent, getMyTeams, registerTeamForSport,
} from "@/lib/services";
import type { Event, Team } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { formatDateRange, formatDate, getErrorMessage } from "@/lib/utils";

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);
  const { user } = useAuth();
  const nav = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postStart, setPostStart] = useState("");
  const [postEnd, setPostEnd] = useState("");
  const [postDuration, setPostDuration] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");

  const [teamRegOpen, setTeamRegOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[] | null>(null);
  const [chosenTeam, setChosenTeam] = useState<number | null>(null);

  const load = async () => {
    if (!user) return;
    setError(null);
    try {
      const all = await listEvents(user.username);
      const found = all.find((e) => e.id === eventId) || null;
      if (!found) setError("Event not found");
      setEvent(found);
    } catch (e) { setError(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.username]);

  const refresh = async () => { await load(); };

  const canManage = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  const handleRegister = async () => {
    if (!user || !event) return;
    if (event.isTeamSport) {
      // Open team picker (player must be a captain of a team in this sport)
      const teams = await getMyTeams(user.username);
      setMyTeams(teams.filter((t) => t.sport.toLowerCase() === event.sport.toLowerCase() && t.captainUsername === user.username && !t.isRegistered));
      setTeamRegOpen(true);
      return;
    }
    setBusy(true);
    try { await registerForEvent(event.id, user.username); toast.success("Registered!"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const submitTeamReg = async () => {
    if (!user || !chosenTeam) return;
    setBusy(true);
    try { await registerTeamForSport(chosenTeam, user.username); toast.success("Team registered!"); setTeamRegOpen(false); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleCancel = async () => {
    if (!user || !event) return;
    setBusy(true);
    try { await cancelEventRegistration(event.id, user.username); toast.success("Cancelled"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleToggle = async () => {
    if (!event) return; setBusy(true);
    try { const r: any = await toggleEventRegistration(event.id); toast.success(`Registration ${r.isOpen ? "opened" : "closed"}`); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleStart = async () => {
    if (!event) return; setBusy(true);
    try { await startEvent(event.id); toast.success("Event started"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };
  const handlePause = async () => {
    if (!event) return; setBusy(true);
    try { await pauseEvent(event.id); toast.success("Event paused"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handlePostpone = async () => {
    if (!event) return; setBusy(true);
    try {
      await postponeEvent(event.id, { startDate: postStart || undefined, endDate: postEnd || undefined, duration: postDuration || undefined });
      toast.success("Event postponed"); setPostponeOpen(false); await refresh();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!event || !user) return;
    setBusy(true);
    try { await deleteEvent(event.id, user.username, deletePw); toast.success("Event deleted"); nav("/events"); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  if (error) return <div className="space-y-3"><Link to="/events" className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</Link><p className="text-destructive">{error}</p></div>;
  if (!event) return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-44" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/events" className="btn-ghost -ml-2 inline-flex"><ArrowLeft className="h-4 w-4" /> Back</Link>

      <div className="card-nuces p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs text-primary-light font-semibold uppercase tracking-wide">{event.sport}</span>
            <h1 className="text-2xl font-extrabold text-primary mt-1">{event.eventName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={event.eventStatus} />
              {event.isRegistrationOpen ? <span className="badge badge-gold">Registration open</span> : <span className="badge badge-cancelled">Registration closed</span>}
              {event.isTeamSport && <span className="badge badge-fss">Team</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.role === "PLAYER" && !event.isTeamSport && (
              event.isRegistered
                ? <Button variant="outline" onClick={handleCancel} loading={busy}>Cancel registration</Button>
                : <Button onClick={handleRegister} loading={busy} disabled={!event.isRegistrationOpen || event.availableSlots <= 0}>Register</Button>
            )}
            {user?.role === "PLAYER" && event.isTeamSport && (
              <Button onClick={handleRegister} loading={busy}>Register team</Button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Stat icon={Calendar} label="Dates" value={formatDateRange(event.startDate, event.endDate)} />
          <Stat icon={Clock} label="Duration" value={event.duration || "—"} />
          <Stat icon={DollarSign} label="Fee" value={event.fee ? `Rs ${event.fee}` : "Free"} />
          <Stat icon={Trophy} label="Format" value={event.tournamentType || "—"} />
          <Stat icon={Users2} label="Slots" value={`${(event.totalSlots ?? 0) - (event.availableSlots ?? 0)}/${event.totalSlots ?? 0}`} />
          {event.isTeamSport && <Stat icon={Users2} label="Team cap" value={event.teamCap?.toString() || "—"} />}
          {event.isTeamSport && <Stat icon={Users2} label="Min required" value={event.minRequired?.toString() || "—"} />}
        </div>

        {event.picture && (
          <img src={event.picture} alt={event.eventName} className="mt-6 rounded-lg w-full max-h-80 object-cover" />
        )}
      </div>

      <div className="card-nuces p-5">
        <h2 className="text-base font-semibold text-primary mb-3">Registered participants ({(event.totalSlots ?? 0) - (event.availableSlots ?? 0)})</h2>
        {/* Backend gives availableSlots only; full member list isn't exposed except via teams. */}
        <p className="text-sm text-muted-foreground">Live count: {(event.totalSlots ?? 0) - (event.availableSlots ?? 0)} of {event.totalSlots ?? 0} slots filled.</p>
      </div>

      {canManage && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Manage event</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleToggle} loading={busy}>
              <Power className="h-4 w-4" /> {event.isRegistrationOpen ? "Close registrations" : "Open registrations"}
            </Button>
            {event.eventStatus !== "Ongoing" && (
              <Button variant="outline" onClick={handleStart} loading={busy}><Play className="h-4 w-4" /> Start</Button>
            )}
            {event.eventStatus === "Ongoing" && (
              <Button variant="outline" onClick={handlePause} loading={busy}><Pause className="h-4 w-4" /> Pause</Button>
            )}
            <Button variant="outline" onClick={() => { setPostStart(event.startDate || ""); setPostEnd(event.endDate || ""); setPostDuration(event.duration || ""); setPostponeOpen(true); }}>
              <CalendarClock className="h-4 w-4" /> Postpone
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Created by: <strong>{(event as any).createdBy || "—"}</strong></p>
          <p className="text-xs text-muted-foreground">Last update: {formatDate(event.startDate)}</p>
        </div>
      )}

      <Modal open={postponeOpen} onClose={() => setPostponeOpen(false)} title="Postpone event"
        footer={<><Button variant="outline" onClick={() => setPostponeOpen(false)}>Cancel</Button><Button onClick={handlePostpone} loading={busy}>Save</Button></>}>
        <div className="space-y-3">
          <Input type="date" label="New start date" value={postStart} onChange={(e) => setPostStart(e.target.value)} />
          <Input type="date" label="New end date" value={postEnd} onChange={(e) => setPostEnd(e.target.value)} />
          <Input label="Duration" placeholder="e.g. 3 days" value={postDuration} onChange={(e) => setPostDuration(e.target.value)} />
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete event" description="This action cannot be undone. Confirm with your password."
        footer={<><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} loading={busy} disabled={!deletePw}>Delete</Button></>}>
        <Input type="password" label="Your password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} />
      </Modal>

      <Modal open={teamRegOpen} onClose={() => setTeamRegOpen(false)} title="Register a team" description="Select one of your captained teams for this sport.">
        {myTeams === null ? <Skeleton className="h-12" /> : myTeams.length === 0 ? (
          <p className="text-sm text-muted-foreground">You don't have any eligible teams. <Link to="/teams" className="text-primary-light hover:underline">Create one</Link>.</p>
        ) : (
          <div className="space-y-2">
            {myTeams.map((t) => (
              <label key={t.id} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${chosenTeam === t.id ? "border-primary-light bg-primary/5" : "border-border"}`}>
                <div>
                  <p className="text-sm font-semibold text-primary">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.members.length} member{t.members.length !== 1 ? "s" : ""} · cap {t.teamCap}</p>
                </div>
                <input type="radio" name="team" checked={chosenTeam === t.id} onChange={() => setChosenTeam(t.id)} />
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTeamRegOpen(false)}>Cancel</Button>
              <Button onClick={submitTeamReg} loading={busy} disabled={!chosenTeam}>Register team</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <p className="text-sm font-semibold text-primary mt-1">{value}</p>
    </div>
  );
}
