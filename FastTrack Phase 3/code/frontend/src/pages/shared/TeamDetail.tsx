import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserMinus, LogOut, Trash2, Trophy, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getMyTeams, leaveTeam, removeTeamMember, deleteTeam,
  unregisterTeamFromSport, resolveJoinRequest, requestJoinTeam, globalSearch, toggleTeamRequests,
  listEvents, requestEventRegistration,
} from "@/lib/services";
import type { Team, Event } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { getErrorMessage, fileToBase64 } from "@/lib/utils";

export default function TeamDetail() {
  const { id } = useParams();
  const tid = Number(id);
  const { user } = useAuth();
  const nav = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [busy, setBusy] = useState(false);
  const [kickOpen, setKickOpen] = useState<string | null>(null);
  const [kickReason, setKickReason] = useState("");
  const [skillLevel, setSkillLevel] = useState(50);
  const [composition, setComposition] = useState<any>(null);

  // Tournament registration modal state
  const [tournRegOpen, setTournRegOpen] = useState(false);
  const [matchingEvents, setMatchingEvents] = useState<Event[]>([]);
  const [chosenEventId, setChosenEventId] = useState<number | null>(null);
  const [paymentProof, setPaymentProof] = useState("");
  const [autoFill, setAutoFill] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const my = await getMyTeams(user.username);
      let t = my.find((x) => x.id === tid) || null;
      if (!t) {
        const r = await globalSearch({});
        t = r.teams.find((x) => x.id === tid) || null;
      }
      setTeam(t);
      if (t) {
        setSkillLevel(t.skillLevel || 50);
        const { getTeamComposition } = await import("@/lib/services");
        const comp = await getTeamComposition(t.id);
        setComposition(comp);
      }
    } catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tid, user?.username]);

  if (!team) return (
    <div className="space-y-3">
      <button onClick={() => nav(-1)} className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</button>
      <Skeleton className="h-40" />
    </div>
  );

  const isCaptain = team.captainUsername === user?.username;
  const isMember = team.members.includes(user?.username || "");
  const hasRequested = team.pendingRequests.includes(user?.username || "");

  const wrap = async (fn: () => Promise<any>, success: string) => {
    setBusy(true);
    try { await fn(); toast.success(success); await load(); }
    catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const saveSkillLevel = async () => {
    if (!user || !team) return;
    setBusy(true);
    try {
      const { updateTeamSkillLevel } = await import("@/lib/services");
      await updateTeamSkillLevel(team.id, user.username, skillLevel);
      toast.success("Team skill level updated");
      await load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  // Open the tournament registration modal — fetches events matching team sport
  const openTournamentReg = async () => {
    if (!user || !team) return;
    try {
      const allEvents = await listEvents(user.username);
      const eligible = allEvents.filter(
        (e) => e.isTeamSport && e.sport?.toLowerCase() === team.sport?.toLowerCase() && e.isRegistrationOpen
      );
      setMatchingEvents(eligible);
      // Auto-select if only one tournament available
      setChosenEventId(eligible.length === 1 ? eligible[0].id : null);
      setPaymentProof("");
      setAutoFill(false);
      setTournRegOpen(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const submitTournamentReg = async () => {
    if (!user || !team || !chosenEventId) return;
    const chosenEvent = matchingEvents.find((e) => e.id === chosenEventId);
    if (chosenEvent?.fee && chosenEvent.fee > 0 && !paymentProof) {
      return toast.error("Payment proof is required for this event");
    }
    setBusy(true);
    try {
      const res = await requestEventRegistration(chosenEventId, {
        username: user.username,
        isTeam: true,
        teamId: team.id,
        autoFill,
        paymentProof,
      });
      toast.success(res.message || "Team registration request sent to admin for approval!");
      setTournRegOpen(false);
      await load();
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const chosenEvent = matchingEvents.find((e) => e.id === chosenEventId) || null;

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => nav(-1)} className="btn-ghost -ml-2 inline-flex">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Team Header */}
      <div className="card-nuces p-6">
        <div className="flex items-center gap-4">
          {team.logo
            ? <img src={team.logo} className="h-16 w-16 rounded-full object-cover" />
            : <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">{team.name[0]}</div>
          }
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-primary truncate">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.sport} · Captain: <strong>{team.captainUsername}</strong></p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {team.teamCap && <span className="badge badge-upcoming">{team.members.length}/{team.teamCap}</span>}
              {team.isRegistered && <span className="badge badge-ongoing">Registered for tournament</span>}
              {team.isOpenToRequests && <span className="badge badge-gold">Open</span>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {/* Captain: Register for Tournament (goes through approval queue) */}
          {isCaptain && !team.isRegistered && (
            <Button onClick={openTournamentReg} loading={busy}>
              <Trophy className="h-4 w-4" /> Register for Tournament
            </Button>
          )}
          {/* Captain: Unregister (only after admin-approved) */}
          {isCaptain && team.isRegistered && (
            <Button variant="outline" onClick={() => wrap(() => unregisterTeamFromSport(team.id, user!.username), "Unregistered")} loading={busy}>
              <Undo2 className="h-4 w-4" /> Unregister
            </Button>
          )}
          {isCaptain && (
            <Button variant="outline" onClick={() => wrap(() => toggleTeamRequests(team.id, user!.username), "Toggled requests")} loading={busy}>
              {team.isOpenToRequests ? "Stop accepting requests" : "Accept requests"}
            </Button>
          )}
          {isMember && !isCaptain && (
            <Button variant="outline" onClick={() => wrap(() => leaveTeam(team.id, user!.username), "Left team")} loading={busy}>
              <LogOut className="h-4 w-4" /> Leave team
            </Button>
          )}
          {isCaptain && team.members.length === 1 && (
            <Button variant="destructive" onClick={() => wrap(async () => { await deleteTeam(team.id, user!.username); nav("/teams"); }, "Team deleted")} loading={busy}>
              <Trash2 className="h-4 w-4" /> Delete team
            </Button>
          )}
          {!isMember && !hasRequested && team.isOpenToRequests && user?.role === "PLAYER" && (
            <Button onClick={() => wrap(() => requestJoinTeam(team.id, user!.username), "Join request sent")} loading={busy}>
              Request to join
            </Button>
          )}
          {hasRequested && <span className="badge badge-postponed">Join request pending</span>}
        </div>
      </div>

      {/* Team Composition */}
      {composition && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Team Composition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filled Slots</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(composition.filled).map(([role, count]) => (
                  <div key={role} className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                    <span className="text-[10px] font-black text-primary uppercase">{role}</span>
                    <Badge className="h-4 min-w-[1rem] px-1 text-[8px] font-black">{count as any}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Open Slots Needed</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(composition.remaining).map(([role, count]) => (
                  count as number > 0 && (
                    <div key={role} className="flex items-center gap-1.5 bg-secondary/80 px-2.5 py-1 rounded-lg border border-border">
                      <span className="text-[10px] font-black text-foreground uppercase">{role}</span>
                      <Badge variant="outline" className="h-4 min-w-[1rem] px-1 text-[8px] font-black border-primary text-primary">{count as any}</Badge>
                    </div>
                  )
                ))}
                {Object.values(composition.remaining).every(v => v === 0) && (
                  <p className="text-xs text-muted-foreground italic">All slots filled!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Level (captain only) */}
      {isCaptain && user?.role === "PLAYER" && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Team Matchmaking Skill Level</h2>
          <p className="text-sm text-muted-foreground">Adjust your team's skill level (1-100) to find opponents of similar skill.</p>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min="1" max="100" value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))} className="flex-1 accent-primary" />
            <span className="font-bold text-lg w-8 text-center">{skillLevel}</span>
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={saveSkillLevel} loading={busy} disabled={skillLevel === team.skillLevel}>Update skill level</Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="card-nuces p-5">
        <h2 className="text-base font-semibold text-primary mb-3">Members ({team.members.length})</h2>
        <div className="space-y-2">
          {team.members.map((m) => (
            <div key={m} className="rounded-lg border border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">{m[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium">{m}</p>
                  <div className="flex items-center gap-2">
                    {m === team.captainUsername && <span className="badge badge-fss text-[10px]">Captain</span>}
                    {team.memberRoles[m] && <span className="text-[10px] font-bold text-primary uppercase italic">{team.memberRoles[m]}</span>}
                  </div>
                </div>
              </div>
              {isCaptain && m !== team.captainUsername && !team.isRegistered && (
                <Button variant="outline" size="sm" onClick={() => { setKickOpen(m); setKickReason(""); }}>
                  <UserMinus className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending join requests (captain only) */}
      {isCaptain && team.pendingRequests.length > 0 && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Join requests ({team.pendingRequests.length})</h2>
          <div className="space-y-2">
            {team.pendingRequests.map((r) => (
              <div key={r} className="rounded-lg border border-border p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{r}</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => nav(`/review-request/${team.id}/${r}`)}>Review & Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => wrap(() => resolveJoinRequest(team.id, { username: user!.username, requester: r, approve: false }), "Rejected")} loading={busy}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kick member modal */}
      <Modal open={!!kickOpen} onClose={() => setKickOpen(null)} title={`Remove ${kickOpen}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setKickOpen(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!kickReason}
              onClick={() => wrap(async () => { await removeTeamMember(team.id, { admin: user!.username, target: kickOpen!, reason: kickReason }); setKickOpen(null); }, "Removed")}
              loading={busy}>Remove</Button>
          </>
        }>
        <Input label="Reason" value={kickReason} onChange={(e) => setKickReason(e.target.value)} placeholder="e.g. Inactive" />
      </Modal>

      {/* Tournament Registration Modal */}
      <Modal
        open={tournRegOpen}
        onClose={() => setTournRegOpen(false)}
        title="Register Team for Tournament"
        description="Select the tournament you want to register your team for. If a fee is required, upload your payment proof."
        footer={
          <>
            <Button variant="outline" onClick={() => setTournRegOpen(false)}>Cancel</Button>
            <Button
              onClick={submitTournamentReg}
              loading={busy}
              disabled={!chosenEventId || fileProcessing || (!!chosenEvent?.fee && chosenEvent.fee > 0 && !paymentProof)}
            >
              Submit Registration Request
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-1">
          {matchingEvents.length === 0 ? (
            <div className="p-4 bg-secondary/30 rounded-lg border border-border text-center">
              <p className="text-sm text-muted-foreground">No open tournaments found for <strong>{team.sport}</strong>.</p>
              <p className="text-xs text-muted-foreground mt-1">Ask an admin to create or open a {team.sport} tournament first.</p>
            </div>
          ) : (
            <>
              {/* Tournament selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-primary tracking-wider">Select Tournament</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {matchingEvents.map((ev) => (
                    <label
                      key={ev.id}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${chosenEventId === ev.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/20"}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">{ev.eventName}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.fee && ev.fee > 0 ? `Fee: Rs ${ev.fee}` : "Free"} · {ev.availableSlots ?? "?"} slots left
                        </p>
                      </div>
                      <input type="radio" name="tourn" checked={chosenEventId === ev.id} onChange={() => setChosenEventId(ev.id)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto-fill checkbox */}
              {chosenEventId && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoFill} onChange={(e) => setAutoFill(e.target.checked)} className="accent-primary" />
                  <span className="text-sm text-muted-foreground">Auto-fill remaining slots from random pool if team doesn't have enough members.</span>
                </label>
              )}

              {/* Payment proof (only when event has a fee) */}
              {chosenEvent && chosenEvent.fee && chosenEvent.fee > 0 ? (
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-sm font-semibold text-primary">Team Registration Fee: Rs {chosenEvent.fee}</p>
                    <p className="text-xs text-muted-foreground mt-1">Please pay the fee and upload a screenshot (PNG/JPG) or PDF of your payment proof.</p>
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
              ) : chosenEvent ? (
                <p className="text-xs text-muted-foreground border-t border-border pt-2">This tournament is free — no payment proof needed.</p>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
