import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { globalSearch } from "@/lib/services";
import type { SearchResults } from "@/types";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { getErrorMessage } from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("");
  const [openReg, setOpenReg] = useState(false);
  const [openReq, setOpenReq] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      run();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sport, openReg, openReq]);

  const run = async () => {
    setBusy(true);
    try {
      const r = await globalSearch({
        q: q || undefined,
        sport: sport || undefined,
        openRegistration: openReg || undefined,
        openRequests: openReq || undefined,
      });
      setResults(r);
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Search</h1>
        <p className="text-sm text-muted-foreground">Find people, events and teams.</p>
      </div>

      <div className="card-nuces p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Name, sport, etc." value={q} onChange={(e) => setQ(e.target.value)} rightSlot={<SearchIcon className="h-4 w-4 text-muted-foreground" />} />
          <Select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">Sport (optional)…</option>
            {["Football", "Cricket", "Basketball", "Volleyball", "Table Tennis", "Badminton"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-4 text-sm mt-3">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={openReg} onChange={(e) => setOpenReg(e.target.checked)} /> Events with open registration</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={openReq} onChange={(e) => setOpenReq(e.target.checked)} /> Teams open to join requests</label>
        </div>
      </div>

      {busy && <Skeleton className="h-40" />}

      {results && !busy && (
        <div className="space-y-6">
          <Section title={`Profiles (${results.profiles.length})`}>
            {results.profiles.length === 0 ? <EmptyMsg /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.profiles.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <p className="font-semibold text-primary">{p.name}</p>
                    <p className="text-xs text-muted-foreground">@{p.username} · {p.role}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Events (${results.events.length})`}>
            {results.events.length === 0 ? <EmptyMsg /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.events.map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`} className="rounded-lg border border-border p-3 hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary">{e.eventName}</p>
                      <StatusBadge status={e.eventStatus} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{e.sport}</p>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Teams (${results.teams.length})`}>
            {results.teams.length === 0 ? <EmptyMsg /> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.teams.map((t) => (
                  <Link key={t.id} to={`/teams/${t.id}`} className="rounded-lg border border-border p-3 hover:bg-muted/30">
                    <p className="font-semibold text-primary">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.sport} · {t.members.length}/{t.teamCap}</p>
                    {t.isOpenToRequests && <span className="badge badge-gold mt-2">Open</span>}
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="text-base font-semibold text-primary mb-2">{title}</h2>{children}</div>;
}
function EmptyMsg() { return <p className="text-sm text-muted-foreground">No matches.</p>; }
