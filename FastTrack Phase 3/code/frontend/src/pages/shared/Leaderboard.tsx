import { useState, useEffect } from "react";
import { Trophy, Medal, Swords, Crown, Target, Zap } from "lucide-react";
import { getLeaderboard } from "@/lib/services";
import { getErrorMessage } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/common/Skeleton";

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const lb = await getLeaderboard();
      setData(lb || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-44" /></div>;
  if (error) return <div className="text-destructive">{error}</div>;

  const isMock = typeof window !== 'undefined' && localStorage.getItem("USE_MOCK_DATA") === "true";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10 max-w-6xl mx-auto px-4"
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs font-bold uppercase tracking-widest">
            <Crown className="h-3 w-3" /> Hall of Fame
          </div>
          <h1 className="text-5xl font-black tracking-tight text-primary">Leaderboard</h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            Celebrating excellence and competitive spirit across all sports at FastTrack.
          </p>
        </div>
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-primary/50 tracking-widest">Current System</p>
            <p className="text-sm font-bold text-primary">Points → GD → GF</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground text-lg text-center mt-10">
          No match results have been recorded yet.
        </p>
      ) : (
        <div className="space-y-8">
          {data.map((sportData, idx) => {
            const isElim = sportData.tournamentType === "Elimination";
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-nuces !border-none shadow-2xl bg-white overflow-hidden group"
              >
                {/* Sport header */}
                <div className="relative h-32 overflow-hidden">
                  <div className="absolute inset-0 bg-primary opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent)]" />
                  <div className="relative h-full flex items-center justify-between px-8 text-white">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">{sportData.sport}</h2>
                      <p className="text-xs font-semibold opacity-70 uppercase tracking-widest mt-1">Tournament Rankings</p>
                    </div>
                    {isElim ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.1em]">
                        <Swords className="h-3.5 w-3.5" /> Knockout Stage
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.1em]">
                        <Target className="h-3.5 w-3.5" /> League Format
                      </div>
                    )}
                  </div>
                </div>

                {isElim ? (
                  /* ── ELIMINATION PODIUM ── */
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-8 pt-4">
                      {/* Placement logic for Podium UI */}
                      {(() => {
                        const top3 = sportData.leaderboard.slice(0, 3);
                        const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze
                        return podiumOrder.map(posIdx => {
                          const entry = top3[posIdx];
                          if (!entry) return <div key={posIdx} className="hidden md:block w-48" />;
                          
                          const rank = entry.placementRank;
                          const isGold = rank === 1;
                          const height = isGold ? 'h-64' : rank === 2 ? 'h-52' : 'h-44';
                          const scale = isGold ? '1.1' : '1';
                          const colorClass = isGold ? 'from-yellow-400 to-yellow-600' : rank === 2 ? 'from-gray-300 to-gray-500' : 'from-amber-600 to-amber-800';
                          
                          return (
                            <motion.div 
                              key={entry.team}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: isGold ? 1.05 : 1 }}
                              className={`relative w-full md:w-56 flex flex-col items-center`}
                            >
                               {isGold && (
                                 <motion.div 
                                   animate={{ rotate: 360 }}
                                   transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                   className="absolute -top-12 text-yellow-400 opacity-20"
                                 >
                                   <Zap className="h-24 w-24" />
                                 </motion.div>
                               )}
                               <div className="mb-4 text-center z-10">
                                  <p className="text-xs font-black text-primary/40 uppercase tracking-widest">{entry.placement}</p>
                                  <p className="text-xl font-black text-gray-900 truncate max-w-[180px]">{entry.team}</p>
                               </div>
                               <div className={`w-full ${height} rounded-2xl bg-gradient-to-b ${colorClass} shadow-2xl flex flex-col items-center justify-start pt-6 border border-white/20 relative overflow-hidden group`}>
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent)]" />
                                  <div className="text-6xl font-black text-white/50">{rank}</div>
                                  <div className="mt-2">
                                     {isGold ? <Trophy className="h-12 w-12 text-white" /> : <Medal className="h-12 w-12 text-white/80" />}
                                  </div>
                               </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ) : (
                  /* ── ROUND-ROBIN TABLE ── */
                  <>
                    {/* Scoring legend */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/30 px-4 py-2 border-b">
                      <span><span className="font-bold text-primary">Win</span> = 3 pts</span>
                      <span><span className="font-bold text-primary">Draw</span> = 1 pt each</span>
                      <span><span className="font-bold text-primary">Loss</span> = 0 pts</span>
                      <span className="ml-auto italic">Tied by: GD → GF</span>
                    </div>
                    {/* Table header */}
                    <div className="grid grid-cols-[auto_1fr_repeat(4,_auto)] gap-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 px-4 py-2 border-b">
                      <div className="w-8">#</div>
                      <div>Team</div>
                      <div className="w-16 text-center">Pts</div>
                      <div className="w-16 text-center">Wins</div>
                      <div className="w-16 text-center">GD</div>
                      <div className="w-16 text-center">GF</div>
                    </div>
                    {/* Rows */}
                    <div className="divide-y divide-border">
                      {sportData.leaderboard.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">No stats yet.</p>
                      )}
                      {sportData.leaderboard.map((entry: any, i: number) => {
                        let rankColor = "text-muted-foreground";
                        let rowBg = "";
                        let rankIcon: React.ReactNode = <span className="text-xs font-bold">#{i + 1}</span>;

                        if (i === 0) {
                          rankColor = "text-yellow-500"; rowBg = "bg-yellow-50 hover:bg-yellow-100/80";
                          rankIcon = <Trophy className="h-5 w-5 text-yellow-500" />;
                        } else if (i === 1) {
                          rankColor = "text-slate-400"; rowBg = "bg-slate-50 hover:bg-slate-100/80";
                          rankIcon = <Medal className="h-5 w-5 text-slate-400" />;
                        } else if (i === 2) {
                          rankColor = "text-amber-600"; rowBg = "bg-amber-50 hover:bg-amber-100/80";
                          rankIcon = <Medal className="h-5 w-5 text-amber-500" />;
                        }

                        const pts = entry.points ?? (entry.wins * 3);
                        const wins = entry.wins ?? 0;
                        const gd = entry.goalDiff ?? 0;
                        const gf = entry.goalsFor ?? 0;

                        return (
                          <div
                            key={entry.team}
                            className={`grid grid-cols-[auto_1fr_repeat(4,_auto)] gap-0 items-center px-4 py-3 transition-colors ${rowBg}`}
                          >
                            <div className={`w-8 flex justify-center ${rankColor}`}>{rankIcon}</div>
                            <div className="font-semibold text-gray-800 truncate pr-4">{entry.team}</div>
                            <div className="w-16 text-center">
                              <span className="font-black text-primary text-base tabular-nums">{pts}</span>
                              <span className="text-[10px] text-muted-foreground block leading-none">pts</span>
                            </div>
                            <div className="w-16 text-center text-sm font-semibold tabular-nums text-gray-600">{wins}W</div>
                            <div className={`w-16 text-center text-sm font-semibold tabular-nums ${gd > 0 ? "text-green-600" : gd < 0 ? "text-red-500" : "text-gray-400"}`}>
                              {gd > 0 ? "+" : ""}{gd}
                            </div>
                            <div className="w-16 text-center text-sm text-muted-foreground tabular-nums">{gf}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
