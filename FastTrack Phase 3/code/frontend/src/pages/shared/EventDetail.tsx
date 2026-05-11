import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users2, DollarSign, Clock, Trophy, Play, Pause, Trash2, CalendarClock, Power, Edit, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  listEvents, cancelEventRegistration, toggleEventRegistration,
  startEvent, pauseEvent, postponeEvent, makeEventUpcoming, deleteEvent, getMyTeams, registerTeamForSport,
} from "@/lib/services";
import type { Event, Team } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { formatDateRange, formatDate, getErrorMessage, fileToBase64 } from "@/lib/utils";

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

  const [startOpen, setStartOpen] = useState(false);
  const [startVenue, setStartVenue] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");

  const [teamRegOpen, setTeamRegOpen] = useState(false);
  const [liveTeams, setLiveTeams] = useState<any[] | null>(null);
  const [chosenTeam, setChosenTeam] = useState<number | null>(null);

  const [indRegOpen, setIndRegOpen] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  const [fileProcessing, setFileProcessing] = useState(false);
  const [captainRegOpen, setCaptainRegOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [chosenMyTeam, setChosenMyTeam] = useState<number | null>(null);
  const [autoFill, setAutoFill] = useState(false);

  const load = async () => {
    if (!user) return;
    setError(null);
    try {
      const all = await listEvents(user.username);
      const found = all.find((e) => e.id === eventId) || null;
      if (!found) setError("Event not found");
      setEvent(found);
      if (user.role === "PLAYER") {
          const mt = await getMyTeams(user.username);
          setMyTeams(mt);
      }
    } catch (e) { setError(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.username]);

  const refresh = async () => { await load(); };

  const canManage = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  // For team sports: find if any of the player's teams are ALREADY registered for THIS event
  const userRegisteredTeam = event
    ? myTeams.find(t => event.registeredTeamIds?.includes(t.id))
    : null;

  const handleRegister = () => {
    if (!user || !event) return;
    if (event.isTeamSport) {
      import("@/lib/services").then(s => s.getAvailableTeams(event.sport).then(setLiveTeams));
      setChosenTeam(null);
      setPaymentProof("");
      setTeamRegOpen(true);
    } else {
      setPaymentProof("");
      setIndRegOpen(true);
    }
  };

  const submitIndReg = async () => {
    if (!user || !event) return;
    if (event.fee && event.fee > 0 && !paymentProof) {
      console.error("Missing payment proof for individual registration", { fee: event.fee, paymentProof });
      return toast.error("Payment proof required");
    }
    setBusy(true);
    try {
      const { requestEventRegistration } = await import("@/lib/services");
      const res = await requestEventRegistration(event.id, { username: user.username, paymentProof });
      toast.success(res.message || "Registration request sent to admin!");
      setIndRegOpen(false);
      await refresh();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const submitCaptainReg = async () => {
    if (!user || !event || !chosenMyTeam) return;
    if (event.fee && event.fee > 0 && !paymentProof) {
      console.error("Missing payment proof for captain registration", { fee: event.fee, paymentProof });
      return toast.error("Payment proof required");
    }
    setBusy(true);
    try {
      const { requestEventRegistration } = await import("@/lib/services");
      const res = await requestEventRegistration(event.id, { username: user.username, isTeam: true, teamId: chosenMyTeam, autoFill, paymentProof });
      toast.success(res.message || "Team registration request sent to admin!");
      setCaptainRegOpen(false);
      await refresh();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const submitTeamReg = async () => {
    if (!user || !event || !chosenTeam) return;
    if (event.fee && event.fee > 0 && !paymentProof) {
      console.error("Missing payment proof for team join registration", { fee: event.fee, paymentProof });
      return toast.error("Payment proof is required for this event");
    }
    setBusy(true);
    try {
      const { requestEventRegistration } = await import("@/lib/services");
      if (chosenTeam === -1) {
        // Random team — create registration request with isRandomJoin flag
        const res = await requestEventRegistration(event.id, {
          username: user.username,
          paymentProof,
          isRandomJoin: true,
        } as any);
        toast.success(res.message || "Request submitted! Admin will assign you to a team after payment approval.");
      } else {
        // Specific team — create registration request with isSinglePlayerJoin flag
        const res = await requestEventRegistration(event.id, {
          username: user.username,
          paymentProof,
          teamId: chosenTeam,
          isSinglePlayerJoin: true,
        } as any);
        toast.success(res.message || "Request submitted! Admin will add you to the team after payment approval.");
      }
      setTeamRegOpen(false);
      await refresh();
    }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleCancel = async () => {
    if (!user || !event) return;
    setBusy(true);
    try { await cancelEventRegistration(event.id, user.username); toast.success("Cancelled"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleToggle = async () => {
    if (!event || !user) return; setBusy(true);
    try { const r: any = await toggleEventRegistration(event.id, user.username); toast.success(`Registration ${r.isOpen ? "opened" : "closed"}`); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleStartPrompt = () => setStartOpen(true);
  const handleStart = async () => {
    if (!event || !user) return; setBusy(true);
    try { await startEvent(event.id, user.username, startVenue || "TBC"); toast.success("Event started and matches generated!"); setStartOpen(false); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };
  const handlePause = async () => {
    if (!event || !user) return; setBusy(true);
    try { await pauseEvent(event.id, user.username); toast.success("Event paused"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handlePostpone = async () => {
    if (!event || !user) return; setBusy(true);
    try {
      await postponeEvent(event.id, { startDate: postStart || undefined, endDate: postEnd || undefined, duration: postDuration || undefined, adminUsername: user.username });
      toast.success("Event postponed"); setPostponeOpen(false); await refresh();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const handleMakeUpcoming = async () => {
    if (!event || !user) return; setBusy(true);
    try { await makeEventUpcoming(event.id, user.username); toast.success("Event is now upcoming"); await refresh(); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
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
            {user?.role === "PLAYER" && (
              event.registrationStatus === "APPROVED" || event.isRegistered ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-bold uppercase tracking-tight">Registered & Approved</span>
                  {!event.isTeamSport && <Button variant="ghost" size="sm" className="ml-2 h-7 text-xs" onClick={handleCancel} loading={busy}>Cancel</Button>}
                </div>
              ) : event.registrationStatus === "PENDING" ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span className="font-bold uppercase tracking-tight">Registration Pending Admin Approval</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {event.registrationStatus === "REJECTED" && (
                    <p className="text-[10px] text-destructive font-bold uppercase mb-1">Previous request was rejected. You can try again.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!event.isTeamSport ? (
                      <Button onClick={handleRegister} loading={busy} disabled={!event.isRegistrationOpen || event.availableSlots <= 0}>Register Now</Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleRegister}
                          loading={busy}
                          disabled={!event.isRegistrationOpen || event.eventStatus === "Ongoing"}
                        >
                          Join Team / Register
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setPaymentProof(""); setChosenMyTeam(null); setAutoFill(false); setCaptainRegOpen(true); }}
                          disabled={!event.isRegistrationOpen || event.eventStatus === "Ongoing" || !myTeams.some(t => t.sport === event.sport && t.captainUsername === user?.username)}
                        >
                          <Trophy className="h-4 w-4 mr-2" /> Register Your Team
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            )}
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
        <h2 className="text-base font-semibold text-primary mb-3">Registered {event.isTeamSport ? "Teams" : "Participants"} ({(event as any).registeredCount || 0})</h2>
        {event.registeredNames && event.registeredNames.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {event.registeredNames.map((name, i) => (
              <span key={i} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-xs font-medium text-primary flex items-center gap-1.5">
                {event.isTeamSport ? <Trophy className="h-3 w-3" /> : <Users2 className="h-3 w-3" />}
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No registrations yet.</p>
        )}
        <p className="text-xs text-muted-foreground mt-4 italic border-t border-border pt-3">
          Live count: {(event as any).registeredCount || 0} of {event.totalSlots ?? 0} slots filled.
        </p>
      </div>

      {canManage && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Manage event</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => nav(`/events/edit/${event.id}`)}>
              <Edit className="h-4 w-4" /> Edit details
            </Button>
            <Button variant="outline" onClick={handleToggle} loading={busy}>
              <Power className="h-4 w-4" /> {event.isRegistrationOpen ? "Close registrations" : "Open registrations"}
            </Button>
            {event.eventStatus !== "Ongoing" && (
              <Button variant="outline" onClick={handleStartPrompt} loading={busy}><Play className="h-4 w-4" /> Start</Button>
            )}
            {event.eventStatus === "Ongoing" && (
              <Button variant="outline" onClick={handlePause} loading={busy}><Pause className="h-4 w-4" /> Pause</Button>
            )}
            {event.eventStatus === "Postponed" ? (
              <Button variant="outline" onClick={handleMakeUpcoming} loading={busy}>
                <CalendarClock className="h-4 w-4" /> Mark as Upcoming
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setPostStart(event.startDate || ""); setPostEnd(event.endDate || ""); setPostDuration(event.duration || ""); setPostponeOpen(true); }}>
                <CalendarClock className="h-4 w-4" /> Postpone
              </Button>
            )}
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

      <Modal open={startOpen} onClose={() => setStartOpen(false)} title="Start Event" description="Set a venue for the generated matches."
        footer={<><Button variant="outline" onClick={() => setStartOpen(false)}>Cancel</Button><Button onClick={handleStart} loading={busy}>Start Event</Button></>}>
        <div className="space-y-3">
          <Input label="Venue" placeholder="e.g. Main Stadium" value={startVenue} onChange={(e) => setStartVenue(e.target.value)} />
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete event" description="This action cannot be undone. Confirm with your password."
        footer={<><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} loading={busy} disabled={!deletePw}>Delete</Button></>}>
        <Input type="password" label="Your password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} />
      </Modal>

      <Modal open={indRegOpen} onClose={() => setIndRegOpen(false)} title="Register for Event" description="Submit your registration request. It will be reviewed by the admin."
        footer={<><Button variant="outline" onClick={() => setIndRegOpen(false)}>Cancel</Button><Button onClick={submitIndReg} loading={busy} disabled={fileProcessing || (!!event.fee && event.fee > 0 && !paymentProof)}>Submit Request</Button></>}>
        <div className="space-y-4 pt-2">
          {event.fee && event.fee > 0 ? (
            <>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                <p className="text-sm font-semibold text-primary">Registration Fee: Rs {event.fee}</p>
                <p className="text-xs text-muted-foreground mt-1">Please pay the fee and upload a screenshot (PNG/JPG) or PDF of your payment proof.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-primary tracking-wider">Payment Proof (File)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  className="input py-2" 
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2 * 1024 * 1024) { toast.error("File size should be under 2MB"); return; }
                    setFileProcessing(true);
                    try {
                      const base64 = await fileToBase64(f);
                      setPaymentProof(base64);
                    } catch (err) {
                      toast.error("Failed to read file");
                    } finally {
                      setFileProcessing(false);
                    }
                  }} 
                />
                {fileProcessing && <p className="text-[10px] text-primary animate-pulse font-bold">Reading file...</p>}
                {paymentProof && !fileProcessing && <p className="text-[10px] text-green-600 font-bold">✓ File attached</p>}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">This event is free. Just submit to request registration.</p>
          )}
        </div>
      </Modal>

      <Modal open={captainRegOpen} onClose={() => setCaptainRegOpen(false)} title="Register Your Team" description="Submit a registration request for one of your teams."
        footer={<><Button variant="outline" onClick={() => setCaptainRegOpen(false)}>Cancel</Button><Button onClick={submitCaptainReg} loading={busy} disabled={!chosenMyTeam || fileProcessing || (!!event.fee && event.fee > 0 && !paymentProof)}>Submit Request</Button></>}>
        <div className="space-y-4 pt-2">
          {myTeams.length > 0 ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-primary tracking-wider">Select Team</label>
              <select className="input" value={chosenMyTeam || ""} onChange={(e) => setChosenMyTeam(Number(e.target.value))}>
                <option value="" disabled>Select a team...</option>
                {myTeams.filter(t => t.sport === event.sport && t.captainUsername === user?.username).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.members.length} members)</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-destructive">You don't have any teams for this sport.</p>
          )}

          {chosenMyTeam && (
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={autoFill} onChange={(e) => setAutoFill(e.target.checked)} className="accent-primary" />
              <span className="text-sm text-muted-foreground">Auto-fill remaining slots from random pool if my team doesn't have enough members.</span>
            </label>
          )}

          {event.fee && event.fee > 0 && (
            <div className="mt-4">
              <div className="p-3 bg-secondary/30 rounded-lg border border-border mb-3">
                <p className="text-sm font-semibold text-primary">Team Registration Fee: Rs {event.fee}</p>
                <p className="text-xs text-muted-foreground mt-1">Please pay the fee and upload a screenshot (PNG/JPG) or PDF of your payment proof.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-primary tracking-wider">Payment Proof (File)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  className="input py-2" 
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2 * 1024 * 1024) { toast.error("File size should be under 2MB"); return; }
                    setFileProcessing(true);
                    try {
                      const base64 = await fileToBase64(f);
                      setPaymentProof(base64);
                    } catch (err) {
                      toast.error("Failed to read file");
                    } finally {
                      setFileProcessing(false);
                    }
                  }} 
                />
                {fileProcessing && <p className="text-[10px] text-primary animate-pulse font-bold">Reading file...</p>}
                {paymentProof && !fileProcessing && <p className="text-[10px] text-green-600 font-bold">✓ File attached</p>}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={teamRegOpen} onClose={() => setTeamRegOpen(false)} title="Join a Team" description="Select a team with open slots to request joining, or join a random auto-assigned team.">
        {liveTeams === null ? <Skeleton className="h-12" /> : (
          <div className="space-y-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveTeams.map((t) => (
                <label key={t.id} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${chosenTeam === t.id ? "border-primary-light bg-primary/5" : "border-border hover:bg-secondary/20"}`}>
                  <div>
                    <p className="text-sm font-semibold text-primary">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Captain: {t.captainUsername} · Skill: {t.skillLevel}</p>
                  </div>
                  <input type="radio" name="team" checked={chosenTeam === t.id} onChange={() => setChosenTeam(t.id)} />
                </label>
              ))}
              {liveTeams.length === 0 && <p className="text-sm text-muted-foreground italic p-2">No live teams with open requests available right now.</p>}
            </div>

            <label className={`flex items-center justify-between rounded-lg border-2 p-3 cursor-pointer ${chosenTeam === -1 ? "border-primary bg-primary/10" : "border-dashed border-border hover:bg-secondary/20"}`}>
              <div>
                <p className="text-sm font-bold text-primary uppercase">🎲 Join Random Team</p>
                <p className="text-xs text-muted-foreground">Auto-placed into a squad. You might even be captain!</p>
              </div>
              <input type="radio" name="team" checked={chosenTeam === -1} onChange={() => setChosenTeam(-1)} />
            </label>

            {event.fee && event.fee > 0 ? (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-primary">Registration Fee: Rs {event.fee}</p>
                  <p className="text-xs text-muted-foreground mt-1">Please pay the fee and upload your payment proof (PNG/JPG or PDF) below.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-primary tracking-wider">Payment Proof (File)*</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    className="input py-2" 
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 2 * 1024 * 1024) { toast.error("File size should be under 2MB"); return; }
                      setFileProcessing(true);
                      try {
                        const base64 = await fileToBase64(f);
                        setPaymentProof(base64);
                      } catch (err) {
                        toast.error("Failed to read file");
                      } finally {
                        setFileProcessing(false);
                      }
                    }} 
                  />
                  {fileProcessing && <p className="text-[10px] text-primary animate-pulse font-bold">Reading file...</p>}
                  {paymentProof && !fileProcessing && <p className="text-[10px] text-green-600 font-bold">✓ File attached</p>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground border-t border-border pt-2">This event is free — no payment proof needed.</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setTeamRegOpen(false)}>Cancel</Button>
              <Button onClick={submitTeamReg} loading={busy} disabled={!chosenTeam || fileProcessing || (!!event.fee && event.fee > 0 && !paymentProof)}>Proceed</Button>
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
