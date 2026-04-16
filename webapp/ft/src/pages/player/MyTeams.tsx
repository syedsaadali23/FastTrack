import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getMyTeams, createTeam, listEvents } from "@/lib/services";
import type { Team, Event } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { fileToBase64, getErrorMessage } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(60),
  sport: z.string().trim().min(1, "Required"),
  isOpenToRequests: z.boolean().default(true),
});
type Form = z.infer<typeof schema>;

export default function MyTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logo, setLogo] = useState<string>("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { isOpenToRequests: true } });

  const load = async () => {
    if (!user) return;
    try {
      const [t, e] = await Promise.all([getMyTeams(user.username), listEvents(user.username)]);
      setTeams(t); setEvents(e);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  const onSubmit = async (data: Form) => {
    if (!user) return;
    setBusy(true);
    try {
      await createTeam({ ...data, captainUsername: user.username, logo });
      toast.success("Team created");
      setOpen(false); reset(); setLogo(""); await load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const DEFAULT_SPORTS = ["Football", "Cricket", "Basketball", "Volleyball", "Table Tennis", "Badminton"];
  const eventSports = events.filter(e => e.isTeamSport).map(e => e.sport);
  const teamSports = Array.from(new Set([...eventSports, ...DEFAULT_SPORTS]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">My Teams</h1>
          <p className="text-sm text-muted-foreground">Teams you captain or play in.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create team</Button>
      </div>

      {!teams ? <Skeleton className="h-40" /> : teams.length === 0 ? (
        <EmptyState icon={<Users2 className="h-6 w-6" />} title="No teams yet" description="Create a team to register for team-based events." action={<Button onClick={() => setOpen(true)}>Create your first team</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <Link key={t.id} to={`/teams/${t.id}`} className="card-nuces p-5">
              <div className="flex items-center gap-3">
                {t.logo ? <img src={t.logo} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{t.name[0]}</div>}
                <div className="min-w-0">
                  <p className="font-semibold text-primary truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.sport}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="badge badge-upcoming">{t.members.length}/{t.teamCap} members</span>
                {t.isRegistered && <span className="badge badge-ongoing">Registered</span>}
                {t.isOpenToRequests && <span className="badge badge-gold">Open</span>}
                {t.captainUsername === user?.username && <span className="badge badge-fss">Captain</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create a team" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={busy}>Create</Button></>}>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <Input label="Team name (required)" placeholder="The Lions" error={errors.name?.message} {...register("name")} />
          <Select label="Sport (required)" error={errors.sport?.message} {...register("sport")}>
            <option value="">Select sport…</option>
            {teamSports.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("isOpenToRequests")} className="h-4 w-4" />
            <span>Open to join requests (required)</span>
          </label>
          <div>
            <label className="label-field">Logo (optional)</label>
            <input type="file" accept="image/*" className="block w-full text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 1024*1024) { toast.error("Under 1 MB"); return; } setLogo(await fileToBase64(f)); }} />
            {logo && <img src={logo} className="h-16 w-16 rounded-full mt-2 object-cover border border-border" />}
          </div>
        </form>
      </Modal>
    </div>
  );
}
