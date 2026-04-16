import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UserMinus, LogOut, Trash2, Trophy, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getMyTeams, leaveTeam, removeTeamMember, deleteTeam,
  registerTeamForSport, unregisterTeamFromSport, resolveJoinRequest, requestJoinTeam, globalSearch,
} from "@/lib/services";
import type { Team } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { getErrorMessage } from "@/lib/utils";

export default function TeamDetail() {
  const { id } = useParams();
  const tid = Number(id);
  const { user } = useAuth();
  const nav = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [busy, setBusy] = useState(false);
  const [kickOpen, setKickOpen] = useState<string | null>(null);
  const [kickReason, setKickReason] = useState("");

  const load = async () => {
    if (!user) return;
    try {
      // Try my teams; if not found, search all teams
      const my = await getMyTeams(user.username);
      let t = my.find((x) => x.id === tid) || null;
      if (!t) {
        const r = await globalSearch({});
        t = r.teams.find((x) => x.id === tid) || null;
      }
      setTeam(t);
    } catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tid, user?.username]);

  if (!team) return <div className="space-y-3"><Link to="/teams" className="btn-ghost"><ArrowLeft className="h-4 w-4" /> Back</Link><Skeleton className="h-40" /></div>;

  const isCaptain = team.captainUsername === user?.username;
  const isMember = team.members.includes(user?.username || "");
  const hasRequested = team.pendingRequests.includes(user?.username || "");

  const wrap = async (fn: () => Promise<any>, success: string) => {
    setBusy(true);
    try { await fn(); toast.success(success); await load(); }
    catch (e) { toast.error(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/teams" className="btn-ghost -ml-2 inline-flex"><ArrowLeft className="h-4 w-4" /> Back</Link>

      <div className="card-nuces p-6">
        <div className="flex items-center gap-4">
          {team.logo ? <img src={team.logo} className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">{team.name[0]}</div>}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-primary truncate">{team.name}</h1>
            <p className="text-sm text-muted-foreground">{team.sport} · Captain: <strong>{team.captainUsername}</strong></p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge badge-upcoming">{team.members.length}/{team.teamCap}</span>
              {team.isRegistered && <span className="badge badge-ongoing">Registered for sport</span>}
              {team.isOpenToRequests && <span className="badge badge-gold">Open</span>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {isCaptain && !team.isRegistered && (
            <Button onClick={() => wrap(() => registerTeamForSport(team.id, user!.username), "Team registered")} loading={busy}><Trophy className="h-4 w-4" /> Register for sport</Button>
          )}
          {isCaptain && team.isRegistered && (
            <Button variant="outline" onClick={() => wrap(() => unregisterTeamFromSport(team.id, user!.username), "Unregistered")} loading={busy}><Undo2 className="h-4 w-4" /> Unregister</Button>
          )}
          {isMember && !isCaptain && (
            <Button variant="outline" onClick={() => wrap(() => leaveTeam(team.id, user!.username), "Left team")} loading={busy}><LogOut className="h-4 w-4" /> Leave team</Button>
          )}
          {isCaptain && team.members.length === 1 && (
            <Button variant="destructive" onClick={() => wrap(async () => { await deleteTeam(team.id, user!.username); nav("/teams"); }, "Team deleted")} loading={busy}><Trash2 className="h-4 w-4" /> Delete team</Button>
          )}
          {!isMember && !hasRequested && team.isOpenToRequests && user?.role === "PLAYER" && (
            <Button onClick={() => wrap(() => requestJoinTeam(team.id, user!.username), "Join request sent")} loading={busy}>Request to join</Button>
          )}
          {hasRequested && <span className="badge badge-postponed">Join request pending</span>}
        </div>
      </div>

      <div className="card-nuces p-5">
        <h2 className="text-base font-semibold text-primary mb-3">Members ({team.members.length})</h2>
        <div className="space-y-2">
          {team.members.map((m) => (
            <div key={m} className="rounded-lg border border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">{m[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium">{m}</p>
                  {m === team.captainUsername && <span className="badge badge-fss text-[10px]">Captain</span>}
                </div>
              </div>
              {isCaptain && m !== team.captainUsername && !team.isRegistered && (
                <Button variant="outline" size="sm" onClick={() => { setKickOpen(m); setKickReason(""); }}><UserMinus className="h-3.5 w-3.5" /> Remove</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isCaptain && team.pendingRequests.length > 0 && (
        <div className="card-nuces p-5">
          <h2 className="text-base font-semibold text-primary mb-3">Join requests ({team.pendingRequests.length})</h2>
          <div className="space-y-2">
            {team.pendingRequests.map((r) => (
              <div key={r} className="rounded-lg border border-border p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{r}</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => wrap(() => resolveJoinRequest(team.id, { username: user!.username, requester: r, approve: true }), "Approved")} loading={busy}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => wrap(() => resolveJoinRequest(team.id, { username: user!.username, requester: r, approve: false }), "Rejected")} loading={busy}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!kickOpen} onClose={() => setKickOpen(null)} title={`Remove ${kickOpen}`}
        footer={<><Button variant="outline" onClick={() => setKickOpen(null)}>Cancel</Button><Button variant="destructive" disabled={!kickReason} onClick={() => wrap(async () => { await removeTeamMember(team.id, { admin: user!.username, target: kickOpen!, reason: kickReason }); setKickOpen(null); }, "Removed")} loading={busy}>Remove</Button></>}>
        <Input label="Reason" value={kickReason} onChange={(e) => setKickReason(e.target.value)} placeholder="e.g. Inactive" />
      </Modal>
    </div>
  );
}
