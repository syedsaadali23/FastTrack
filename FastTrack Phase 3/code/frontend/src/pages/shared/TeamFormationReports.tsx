import { useState, useEffect } from "react";
import { Users2, BarChart3, Clock, Trophy, Target, TrendingUp, Shield, Activity, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- DUMMY DATA ---

const TARGETS: Record<string, Record<string, number>> = {
  Football: { "Forward": 2, "Midfielder": 4, "Defender": 4, "Goalkeeper": 1 },
  Cricket: { "Batsman": 5, "Wicketkeeper": 1, "All-rounder": 1, "Bowler": 4 },
};

import { getAvailableTeams, getPlayerPool, invitePlayer, updateTeamMemberRole } from "@/lib/services";

export default function TeamFormationReports() {
  const { user } = useAuth();
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [filterSport, setFilterSport] = useState<string>("Football");
  const [filterPos, setFilterPos] = useState<string>("All");
  
  // Fake live refresh
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  useEffect(() => {
    getAvailableTeams().then(t => {
      setAllTeams(t);
      if (t.length > 0 && !selectedTeamId) setSelectedTeamId(String(t[0].id));
    }).catch(()=>{});
    getPlayerPool().then(setAllPlayers).catch(()=>{});

    const interval = setInterval(() => setLastRefreshed(new Date()), 10000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const getSkillColor = (skill: number) => {
    if (skill >= 90) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (skill >= 80) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (skill >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  // --- REPORT 1: TEAM COMPOSITION VIEW ---
  const selectedTeam = allTeams.find(t => String(t.id) === selectedTeamId) || allTeams[0];
  const renderTeamComposition = () => {
    if (!selectedTeam) return <p className="text-muted-foreground text-sm">No team selected or available.</p>;
    const roles = TARGETS[selectedTeam.sport] || {};
    // memberRoles is { username: role } — build a role→[usernames] map
    const roleToPlayers: Record<string, string[]> = {};
    Object.entries((selectedTeam.memberRoles as Record<string, string>) || {}).forEach(([username, role]) => {
      if (!roleToPlayers[role]) roleToPlayers[role] = [];
      roleToPlayers[role].push(username);
    });

    const unassignedPlayers: string[] = [];
    Object.entries((selectedTeam.memberRoles as Record<string, string>) || {}).forEach(([username, role]) => {
      const playersInRole = roleToPlayers[role] || [];
      const roleLimit = roles[role] || 0;
      // If player is beyond the role limit or role is not in TARGETS, add to unassigned
      const indexInRole = playersInRole.indexOf(username);
      if (indexInRole >= roleLimit || !roles[role]) {
        unassignedPlayers.push(`${username} (${role})`);
      }
    });

    const footballField = selectedTeam.sport === "Football" ? (
      <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-green-700/20 rounded-lg border-2 border-green-600/30 overflow-hidden shadow-inner">
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <rect width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="4" className="text-green-500" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-green-500" />
          <circle cx="50%" cy="50%" r="15%" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" />
          <rect x="25%" y="0" width="50%" height="15%" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" />
          <rect x="25%" y="85%" width="50%" height="15%" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500" />
          <circle cx="50%" cy="10%" r="1%" fill="currentColor" className="text-green-500" />
          <circle cx="50%" cy="90%" r="1%" fill="currentColor" className="text-green-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col justify-around py-4">
          {['Forward', 'Midfielder', 'Defender', 'Goalkeeper'].map((role) => (
            <div key={role} className="flex justify-evenly w-full px-4">
              {Array.from({ length: roles[role] || 0 }).map((_, i) => {
                const playersInRole = roleToPlayers[role] || [];
                const player = playersInRole[i];
                return (
                  <div key={i} className="flex flex-col items-center gap-1 z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer",
                      player ? "bg-primary text-primary-foreground border-2 border-primary" : "bg-secondary/50 border-2 border-dashed border-muted-foreground text-muted-foreground"
                    )}>
                      {player ? <UserIcon className="w-5 h-5" /> : "?"}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-background/80 px-1 rounded text-foreground">{role.substring(0,3)}</span>
                    {player && <span className="text-[8px] text-primary font-bold bg-background/80 px-1 rounded truncate max-w-[44px]">@{player}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(roles).map(([role, count]) => (
          <div key={role} className="bg-secondary/50 p-4 rounded-xl border border-border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{role} ({count})</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: count as number }).map((_, i) => {
                const player = (roleToPlayers[role] || [])[i];
                return (
                  <div key={i} className={cn(
                    "flex-1 min-w-[3rem] h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                    player ? "bg-primary text-primary-foreground shadow" : "border-2 border-dashed border-border text-muted-foreground"
                  )}>
                    {player ? `@${player}` : "Open"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users2 className="w-4 h-4" /> Roster Management
              </h3>
              <div className="space-y-2">
                {Object.keys(selectedTeam.memberRoles || {}).map(username => (
                  <div key={username} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">@{username}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{username === selectedTeam.captainUsername ? "Captain" : "Member"}</span>
                    </div>
                    {selectedTeam.captainUsername === user?.username ? (
                      <Select 
                        value={selectedTeam.memberRoles[username]} 
                        onChange={(e) => handleRoleChange(username, e.target.value)}
                        className="w-32 h-8 text-[10px]"
                      >
                        {Object.keys(roles).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                        <option value="Squad Member">Squad Member</option>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">{selectedTeam.memberRoles[username]}</Badge>
                    )}
                  </div>
                ))}
              </div>
           </div>
           <div>
             {footballField}
           </div>
        </div>
        
        {unassignedPlayers.length > 0 && (
          <div className="card-nuces p-4 border-l-4 border-l-primary/50 bg-primary/5">
             <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Bench / Unassigned Roles</h4>
             <div className="flex flex-wrap gap-2">
                {unassignedPlayers.map(p => (
                   <Badge key={p} variant="outline" className="text-[10px] font-bold">@{p}</Badge>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  };


  // --- REPORT 2: PLAYER POOL STATUS ---
  const renderPoolStatus = () => {
    if (!selectedTeam) return <p className="text-muted-foreground text-sm">No team selected.</p>;
    
    const roles = TARGETS[selectedTeam.sport] || {};
    
    // Count roles assigned in the selected team
    const roleCounts: Record<string, number> = {};
    Object.values((selectedTeam.memberRoles as Record<string, string>) || {}).forEach(r => {
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    });
    
    // Calculate total progress
    let totalTarget = 0;
    let totalAvailable = 0;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-primary italic tracking-tighter">Live Pool Stats</h3>
            <p className="text-xs text-muted-foreground">Team: {selectedTeam.name}</p>
          </div>
          <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
        </div>
        
        <div className="space-y-4">
          {Object.entries(roles).map(([role, targetCount]) => {
            const available = roleCounts[role] || 0;
            totalTarget += targetCount;
            totalAvailable += Math.min(available, targetCount); // Cap for readiness progress
            const pct = Math.min((available / targetCount) * 100, 100);
            
            return (
              <div key={role} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>{role}</span>
                  <span>{Math.min(available, targetCount)} / {targetCount}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
            <span className="text-foreground">Formation Readiness</span>
            <span className="text-primary">{totalTarget > 0 ? Math.round((totalAvailable/totalTarget)*100) : 0}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
             <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${totalTarget > 0 ? (totalAvailable/totalTarget)*100 : 0}%` }} />
          </div>
        </div>
      </div>
    );
  };

  // --- REPORT 3: PLAYER POOL BROWSER TABLE ---
  // Build a set of usernames already assigned to any team — they should NOT appear in the pool
  const usersInTeams = new Set<string>(
    allTeams.flatMap(t => Object.keys(t.memberRoles as Record<string, string> || {}))
  );

  const filteredPlayers = allPlayers.filter(p =>
    !usersInTeams.has(p.username) &&
    (filterSport === "All" || p.sport === filterSport) &&
    (filterPos === "All" || p.position === filterPos)
  );

  // --- REPORT 4: TEAM STRENGTH OVERVIEW ---
  const renderTeamStrength = () => {
    const teamsToDisplay = user?.role === "PLAYER" 
      ? allTeams.filter(t => t.members?.includes(user.username) || Object.keys(t.memberRoles || {}).includes(user.username))
      : allTeams;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamsToDisplay.map(team => {
          const roles = TARGETS[team.sport] || {};
          const required = Object.values(roles).reduce((a, b) => a + b, 0);
          
          // Calculate filled slots capped at target (duplicates don't count towards coverage)
          const roleCounts: Record<string, number> = {};
          Object.values(team.memberRoles as Record<string, string>).forEach(r => {
            roleCounts[r] = (roleCounts[r] || 0) + 1;
          });
          
          let filled = 0;
          Object.entries(roles).forEach(([role, target]) => {
            filled += Math.min(roleCounts[role] || 0, target);
          });

          const pct = Math.round((filled / required) * 100);
          
          return (
            <div key={team.id} className="card-nuces p-5 space-y-4 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black uppercase italic tracking-tighter text-lg">{team.name}</h4>
                  <Badge variant="secondary" className="text-[9px] mt-1">{team.sport}</Badge>
                </div>
                <div className="text-center bg-primary/10 rounded-lg p-2 border border-primary/20">
                  <span className="block text-xl font-black text-primary leading-none">{team.avgSkill}</span>
                  <span className="text-[8px] uppercase font-bold text-muted-foreground">Avg Skill</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Role Coverage</span>
                  <span>{filled}/{required}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- REPORT 5: ROLE DEMAND HEATMAP ---
  const renderHeatmap = () => {
    const allRoles = Array.from(new Set(Object.values(TARGETS).flatMap(o => Object.keys(o))));
    const sports = ["Football", "Cricket"];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">Sport</th>
              {allRoles.map(r => (
                <th key={r} className="p-3 text-center text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border min-w-[80px]">{r.substring(0,3)}</th>
              ))}
              <th className="p-3 text-right text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sports.map(sport => {
              const sportTeams = allTeams.filter(t => t.sport === sport);
              return (
                <tr key={sport} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-bold text-sm">{sport}</td>
                  {allRoles.map(role => {
                    const isValidRole = !!TARGETS[sport]?.[role];
                    
                    let demand = 0;
                    if (isValidRole) {
                      sportTeams.forEach(team => {
                        const target = TARGETS[sport][role] || 0;
                        const filled = Object.values(team.memberRoles as Record<string, string> || {}).filter(r => r === role).length;
                        demand += Math.max(0, target - filled);
                      });
                    }
                    
                    let bgClass = "bg-secondary/10";
                    if (!isValidRole) bgClass = "bg-transparent";
                    else if (demand >= 5) bgClass = "bg-red-500/80 text-white font-black";
                    else if (demand >= 2) bgClass = "bg-amber-500/80 text-white font-black";
                    else if (demand > 0) bgClass = "bg-green-500/80 text-white font-black";
                    else bgClass = "bg-secondary/50 text-muted-foreground";

                    return (
                      <td key={role} className="p-2">
                        <div className={cn("h-10 rounded-md flex items-center justify-center text-xs shadow-inner", bgClass)}>
                          {isValidRole ? demand : "-"}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 text-right">
                    <Badge variant="outline" className="text-[10px]"><TrendingUp className="w-3 h-3 mr-1"/> Active</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Invite Handler
  const handleInvite = async (playerUsername: string) => {
    if (!user || !selectedTeam) return;
    if (selectedTeam.captainUsername !== user.username) {
      toast.error("Only the captain can invite players.");
      return;
    }
    try {
      await invitePlayer(selectedTeam.id, user.username, playerUsername);
      toast.success(`Invitation sent to @${playerUsername}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRoleChange = async (targetMember: string, newRole: string) => {
    if (!user || !selectedTeam) return;
    try {
      await updateTeamMemberRole(selectedTeam.id, user.username, targetMember, newRole);
      toast.success(`Role for @${targetMember} updated to ${newRole}`);
      // Refresh teams
      const t = await getAvailableTeams();
      setAllTeams(t);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const getErrorMessage = (e: any) => {
    return e.response?.data?.message || e.message || "An error occurred";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">Team Formation Reports</h1>
          <p className="text-sm text-muted-foreground">Live analytics and visualization of player pools and team structures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REPORT 1 */}
        <div className="card-nuces p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Team Composition View</h2>
            <Select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="w-48">
              {allTeams.filter(t => !!TARGETS[t.sport]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
          {renderTeamComposition()}
        </div>

        {/* REPORT 2 */}
        <div className="card-nuces p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
             <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Pool Status</h2>
          </div>
          {renderPoolStatus()}
        </div>
      </div>

      {/* REPORT 3 */}
      <div className="card-nuces p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users2 className="w-5 h-5 text-primary" /> Player Pool Browser</h2>
          <div className="flex gap-2">
            <Select value={filterSport} onChange={e => setFilterSport(e.target.value)} className="w-32">
              <option value="All">All Sports</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
            </Select>
            <Select value={filterPos} onChange={e => setFilterPos(e.target.value)} className="w-32">
              <option value="All">All Roles</option>
              {Object.keys(TARGETS[filterSport === "All" ? "Football" : filterSport] || {}).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Sport</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Skill MMR</th>
                <th className="px-6 py-4">In Pool Since</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlayers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground italic">No players are currently in the pool.</td></tr>
              ) : filteredPlayers.map(p => (
                <tr key={p.username} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">@{p.username}</td>
                  <td className="px-6 py-4 font-medium">{p.sport}</td>
                  <td className="px-6 py-4"><Badge variant="outline">{p.position}</Badge></td>
                  <td className="px-6 py-4">
                    <Badge className={cn("font-black", getSkillColor(p.skillLevel))}>{p.skillLevel}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.since ? new Date(p.since).toLocaleString() : "Just now"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      className="h-8 text-[10px] uppercase font-black italic tracking-tighter"
                      disabled={!selectedTeam || selectedTeam.captainUsername !== user?.username || selectedTeam.sport !== p.sport}
                      onClick={() => handleInvite(p.username)}
                    >
                      Invite to {selectedTeam?.name || "Team"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT 4 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 px-2"><Shield className="w-5 h-5 text-primary" /> Team Strength Overview</h2>
        {renderTeamStrength()}
      </div>

      {/* REPORT 5 */}
      <div className="card-nuces p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Role Demand Heatmap</h2>
          <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">High Demand Alert</Badge>
        </div>
        {renderHeatmap()}
      </div>
    </div>
  );
}
