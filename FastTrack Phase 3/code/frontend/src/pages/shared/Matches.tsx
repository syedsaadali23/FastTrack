import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMatches, scheduleMatch, recordMatchResult } from "@/lib/services";
import { getErrorMessage } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Trophy, MapPin, Clock, ChevronRight, Swords, History, Zap } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/common/Skeleton";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [t1Score, setT1Score] = useState("");
  const [t2Score, setT2Score] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const ms = await getMatches();
      setMatches(ms || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const canManage = user?.role === "ADMIN" || user?.role === "ORGANIZER";

  const handleRecord = async () => {
    if (!selectedMatch || !user) return;
    setBusy(true);
    try {
      await recordMatchResult(selectedMatch.id, parseInt(t1Score), parseInt(t2Score), user.username);
      toast.success("Result recorded successfully");
      setResultModalOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openResultModal = (m: any) => {
    setSelectedMatch(m);
    setT1Score("");
    setT2Score("");
    setResultModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedMatch || !user) return;
    setBusy(true);
    try {
      await scheduleMatch(selectedMatch.id, startTime, endTime, user.username);
      toast.success("Match scheduled!");
      setScheduleModalOpen(false);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openScheduleModal = (m: any) => {
    setSelectedMatch(m);
    setStartTime(m.startTime || "");
    setEndTime(m.endTime || "");
    setScheduleModalOpen(true);
  };

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-44" /></div>;
  if (error) return <div className="text-destructive">{error}</div>;

  // Group matches by eventId
  const byEvent: Record<string, any[]> = {};
  for (const m of matches) {
    const key = String(m.eventId ?? "unknown");
    if (!byEvent[key]) byEvent[key] = [];
    byEvent[key].push(m);
  }

  const isEliminationEvent = (eventMatches: any[]) =>
    eventMatches.some(
      (m) =>
        (m.nextMatchId !== null && m.nextMatchId !== undefined) ||
        (m.team1Name && m.team1Name.startsWith("Winner of")) ||
        (m.team2Name && m.team2Name.startsWith("Winner of"))
    );

  const roundLabel = (round: number, totalRounds: number) => {
    const fromEnd = totalRounds - round;
    if (fromEnd === 0) return "🏆 Final";
    if (fromEnd === 1) return "Semi-Finals";
    if (fromEnd === 2) return "Quarter-Finals";
    return `Round of ${Math.pow(2, fromEnd + 1)}`;
  };

  const isMock = typeof window !== 'undefined' && localStorage.getItem("USE_MOCK_DATA") === "true";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto px-4"
    >
      <AnimatePresence>
        {isMock && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-accent-gold/10 border border-accent-gold/20 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-gold"
          >
            <Zap className="h-3 w-3" /> Mock Data Mode Enabled
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Tournament Matches
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track scheduled fixtures, live results, and tournament progression.
          </p>
        </div>
      </div>

      {Object.keys(byEvent).length === 0 && (
        <p className="text-muted-foreground text-center py-10">
          No matches generated yet. Start an event to generate matches.
        </p>
      )}

      {Object.entries(byEvent).map(([eventId, eventMatches]) => {
        const sample = eventMatches[0];
        const sport = sample?.sport ?? "Unknown";
        const isElim = isEliminationEvent(eventMatches);

        const sorted = [...eventMatches].sort(
          (a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0)
        );
        const byRound: Record<number, any[]> = {};
        for (const m of sorted) {
          const r = m.roundNumber ?? 1;
          if (!byRound[r]) byRound[r] = [];
          byRound[r].push(m);
        }
        const rounds = Object.keys(byRound)
          .map(Number)
          .sort((a, b) => a - b);
        const totalRounds = rounds.length;

        return (
          <motion.div
            key={eventId}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-nuces !border-none shadow-xl bg-white overflow-hidden"
          >
            {/* Event header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-4 flex flex-wrap items-center gap-4 text-white">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-none">{sport} Tournament</h2>
                <div className="flex items-center gap-2 mt-1 opacity-90 text-[10px] font-semibold uppercase tracking-widest">
                  <span className="bg-black/20 px-2 py-0.5 rounded">Event #{eventId}</span>
                  {isElim && (
                    <span className="bg-accent-gold text-accent-gold-foreground px-2 py-0.5 rounded">
                      Knockout Stage
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isElim ? (
              /* ── ELIMINATION BRACKET ── */
              <div className="p-8 overflow-x-auto">
                <div className="flex items-stretch gap-12 min-w-max pb-4">
                  {rounds.map((round, roundIdx) => {
                    const visibleMatches = byRound[round].filter(
                      (m: any) => !(m.team1Name === "BYE" && m.team2Name === "BYE")
                    );

                    return (
                      <div
                        key={round}
                        className="flex flex-col relative"
                        style={{ width: 280 }}
                      >
                        {/* Round label */}
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm mb-8 text-center">
                          <div className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-1">
                            Stage {roundIdx + 1}
                          </div>
                          <div className="text-sm font-extrabold text-primary">
                            {roundLabel(round, totalRounds)}
                          </div>
                          <div className="h-1 w-8 bg-accent-gold mx-auto mt-2 rounded-full" />
                        </div>

                        {/* Matches column */}
                        <div className="flex flex-col justify-around flex-grow space-y-12">
                          {visibleMatches.map((m: any) => {
                            const isTBD =
                              (m.team1Name && m.team1Name.startsWith("Winner of")) ||
                              (m.team2Name && m.team2Name.startsWith("Winner of"));

                            return (
                              <motion.div 
                                key={m.id} 
                                className="relative group"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                {/* Match card */}
                                <div
                                  className={`rounded-xl border-2 overflow-hidden shadow-md transition-all duration-300
                                  ${m.status === "Finished"
                                      ? "border-green-100 bg-green-50/30"
                                      : "border-gray-100 bg-white"
                                    }`}
                                >
                                  {/* Team 1 row */}
                                  <div
                                    className={`flex items-center justify-between px-4 py-3 border-b border-gray-100
                                    ${m.winner === m.team1Name
                                        ? "bg-green-100/50 text-green-900 font-bold"
                                        : "text-gray-900"
                                      }`}
                                  >
                                    <span className="truncate flex-1 text-sm">
                                      {m.team1Name?.startsWith("Winner of") ? (
                                        <span className="text-gray-400 italic text-xs">Waiting for result...</span>
                                      ) : m.team1Name}
                                    </span>
                                    {m.status === "Finished" && (
                                      <span className="ml-3 font-mono text-base font-black tabular-nums">{m.team1Score}</span>
                                    )}
                                  </div>

                                  {/* Team 2 row */}
                                  <div
                                    className={`flex items-center justify-between px-4 py-3
                                    ${m.winner === m.team2Name
                                        ? "bg-green-100/50 text-green-900 font-bold"
                                        : "text-gray-900"
                                      }`}
                                  >
                                    <span className="truncate flex-1 text-sm">
                                      {m.team2Name?.startsWith("Winner of") ? (
                                        <span className="text-gray-400 italic text-xs">Waiting for result...</span>
                                      ) : m.team2Name}
                                    </span>
                                    {m.status === "Finished" && (
                                      <span className="ml-3 font-mono text-base font-black tabular-nums">{m.team2Score}</span>
                                    )}
                                  </div>

                                  {/* Footer Actions */}
                                  {canManage && m.status !== "Finished" && !isTBD && (
                                    <div className="flex gap-2 p-2 bg-gray-50 border-t border-gray-100">
                                      <button
                                        onClick={() => openScheduleModal(m)}
                                        className="flex-1 text-[10px] font-bold py-1.5 px-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                                      >
                                        <Clock className="h-3 w-3" /> Schedule
                                      </button>
                                      <button
                                        onClick={() => openResultModal(m)}
                                        className="flex-1 text-[10px] font-bold py-1.5 px-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-1"
                                      >
                                        <Trophy className="h-3 w-3" /> Record
                                      </button>
                                    </div>
                                  )}

                                  {m.status === "Finished" && m.winner && (
                                    <div className="py-1 px-4 bg-green-500 text-[10px] font-bold text-white uppercase tracking-widest text-center">
                                      {m.winner === "Draw" ? "Match Drawn" : `${m.winner} Advanced`}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Connector Lines Logic */}
                                {roundIdx < totalRounds - 1 && (
                                  <div className="absolute top-1/2 -right-12 w-12 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ── ROUND-ROBIN LIST VIEW ── */
              <div className="p-4 space-y-6">
                {rounds.map((round) => {
                  const roundMatches = byRound[round].filter(
                    (m: any) => m.team1Name !== "BYE" && m.team2Name !== "BYE"
                  );
                  if (roundMatches.length === 0) return null;
                  return (
                    <div key={round}>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 border-b pb-1">
                        Round {round}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {roundMatches.map((m: any) => (
                          <div
                            key={m.id}
                            className={`rounded-lg border p-4 space-y-2
                              ${m.status === "Finished"
                                ? "bg-muted/20 border-border"
                                : "border-l-4 border-l-primary/60 bg-white"
                              }`}
                          >
                            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                              <span className="font-semibold uppercase">{m.sport}</span>
                              {m.startTime && (
                                <span>
                                  🕐 {m.startTime.replace("T", " ").slice(0, 16)}
                                </span>
                              )}
                            </div>
                            {m.status !== "Finished" ? (
                              <>
                                <div className="flex justify-between items-center text-base font-bold py-1">
                                  <span className="truncate flex-1 text-center">
                                    {m.team1Name}
                                  </span>
                                  <span className="px-2 text-muted-foreground text-sm">
                                    vs
                                  </span>
                                  <span className="truncate flex-1 text-center">
                                    {m.team2Name}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
                                  <span>📍 {m.venue || "TBA"}</span>
                                  {canManage && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => openScheduleModal(m)}
                                        className="text-[10px] px-2 py-0.5 border rounded hover:bg-muted transition-colors"
                                      >
                                        Schedule
                                      </button>
                                      <button
                                        onClick={() => openResultModal(m)}
                                        className="text-[10px] px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                                      >
                                        Record
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-center items-center py-1 gap-3">
                                  <span
                                    className={`font-bold truncate text-center flex-1
                                    ${m.winner === m.team1Name ? "text-green-600" : "text-muted-foreground"}`}
                                  >
                                    {m.team1Name}
                                  </span>
                                  <span className="font-black text-xl tabular-nums text-gray-700">
                                    {m.team1Score} – {m.team2Score}
                                  </span>
                                  <span
                                    className={`font-bold truncate text-center flex-1
                                    ${m.winner === m.team2Name ? "text-green-600" : "text-muted-foreground"}`}
                                  >
                                    {m.team2Name}
                                  </span>
                                </div>
                                <div className="text-center text-xs text-muted-foreground">
                                  {m.winner === "Draw" ? "Match Drawn" : `Winner: ${m.winner}`}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Record Result Modal */}
      <Modal
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Record Match Result"
        footer={
          <>
            <Button variant="outline" onClick={() => setResultModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecord}
              loading={busy}
              disabled={!t1Score || !t2Score}
            >
              Save
            </Button>
          </>
        }
      >
        {selectedMatch && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <Input
                type="number"
                label={selectedMatch.team1Name}
                placeholder="Score"
                value={t1Score}
                onChange={(e) => setT1Score(e.target.value)}
              />
              <span className="px-2 font-bold text-muted-foreground pt-6">vs</span>
              <Input
                type="number"
                label={selectedMatch.team2Name}
                placeholder="Score"
                value={t2Score}
                onChange={(e) => setT2Score(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Equal scores → Draw. In elimination brackets, use different scores to
              determine who advances.
            </p>
          </div>
        )}
      </Modal>

      {/* Schedule Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Match Time"
        footer={
          <>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              loading={busy}
              disabled={!startTime || !endTime}
            >
              Save Schedule
            </Button>
          </>
        }
      >
        {selectedMatch && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">
              {selectedMatch.team1Name} vs {selectedMatch.team2Name}
            </p>
            <Input
              type="datetime-local"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              type="datetime-local"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Player overlaps with other scheduled matches are automatically blocked.
            </p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}