import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Search, XCircle, UserPlus, Shield, Info, Clock, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  getMyTeams, findMatch, cancelMatchmaking, getAvailableTeams, getPlayerPool, requestJoinTeam, getProfile
} from "@/lib/services";
import type { Match, Profile } from "@/types";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { getErrorMessage, cn } from "@/lib/utils";
import { Badge } from "@/components/common/Badge";
import { listEvents } from "@/lib/services";
import type { Event } from "@/types";

type View = "OPPONENT" | "TEAMS" | "PLAYERS";

type AvailableTeam = {
  id: number;
  name: string;
  sport: string;
  logo: string | null;
  skillLevel: number;
  captainUsername: string;
  openSlots: Record<string, number>;
};

export default function Matchmaking() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [view, setView] = useState<View>("OPPONENT");
  
  // Tab 1: Opponent Matchmaking (Existing)
  const [type, setType] = useState<"INDIVIDUAL" | "TEAM">("INDIVIDUAL");
  const [myCapTeams, setMyCapTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [status, setStatus] = useState<"IDLE" | "SEARCHING" | "FOUND">("IDLE");
  const [foundMatch, setFoundMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // Tab 2 & 3: Browse Pool
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [playerPool, setPlayerPool] = useState<any[]>([]);
  const [filterSport, setFilterSport] = useState<string>("Football");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);

  useEffect(() => {
    if (user) {
      getMyTeams(user.username)
        .then((t) => {
          const capTeams = t.filter(x => x.captainUsername === user.username);
          setMyCapTeams(capTeams);
          if (capTeams.length > 0) setSelectedTeam(String(capTeams[0].id));
        })
        .catch(() => {});
      
      getProfile(user.username).then(setUserProfile).catch(() => {});
      listEvents(user.username).then(setEvents).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (view === "TEAMS") {
      setLoadingPool(true);
      getAvailableTeams(filterSport === "All" ? undefined : filterSport)
        .then(setAvailableTeams)
        .finally(() => setLoadingPool(false));
    } else if (view === "PLAYERS") {
      setLoadingPool(true);
      getPlayerPool(filterSport === "All" ? undefined : filterSport)
        .then(setPlayerPool)
        .finally(() => setLoadingPool(false));
    }
  }, [view, filterSport]);

  const handleFindMatch = async () => {
    if (!user) return;
    if (type === "TEAM" && !selectedTeam) {
      toast.error("Please select a team");
      return;
    }
    
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }
    
    setStatus("SEARCHING");
    const id = type === "INDIVIDUAL" ? user.username : selectedTeam;
    
    try {
      const eId = parseInt(selectedEventId);
      const chosenEvent = events.find(e => e.id === eId);
      const matchSport = chosenEvent ? chosenEvent.sport : "Football";
      const res = await findMatch(type, id, matchSport, eId);
      if (res.match) {
        setFoundMatch(res.match);
        setStatus("FOUND");
      } else {
        toast.info(res.message);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
      setStatus("IDLE");
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    try {
      const id = type === "INDIVIDUAL" ? user.username : selectedTeam;
      await cancelMatchmaking(type, id);
      toast.success("Matchmaking cancelled");
      setStatus("IDLE");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleJoinRequest = async (teamId: number, teamSport: string) => {
    if (!user || !userProfile) return;
    
    // Check if player has set their role for this sport
    const role = userProfile.preferredPositions?.[teamSport];
    if (!role) {
      toast.error(`Please set your preferred position for ${teamSport} in your profile first.`);
      nav("/profile");
      return;
    }

    try {
      await requestJoinTeam(teamId, user.username);
      toast.success("Join request sent to captain!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleInvitePlayer = async (playerUsername: string) => {
     // This would typically open a modal to select which team to invite them to
     toast.info(`Invitation feature coming soon. For now, players can request to join your teams.`);
  };

  const getSkillBadgeColor = (level: number) => {
    if (level >= 80) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (level >= 40) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter italic">Matchmaking Hub</h1>
          <p className="text-sm text-muted-foreground">Find matches, join teams, or recruit players.</p>
        </div>

        <div className="flex p-1 bg-secondary/50 rounded-xl border border-border">
          <button
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
              view === "OPPONENT" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => setView("OPPONENT")}
          >
            Find Opponent
          </button>
          <button
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
              view === "TEAMS" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => setView("TEAMS")}
          >
            Browse Teams
          </button>
          {user?.role === "PLAYER" && (
            <button
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                view === "PLAYERS" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => setView("PLAYERS")}
            >
              Recruit Players
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {view === "OPPONENT" && (
          <div className="card-nuces p-8 max-w-2xl mx-auto w-full">
            {status === "IDLE" && (
              <div className="space-y-6">
                <div className="flex gap-4 p-1 bg-secondary rounded-lg w-full max-w-sm mx-auto">
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${type === "INDIVIDUAL" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"}`}
                    onClick={() => { setType("INDIVIDUAL"); setSelectedEventId(""); }}
                  >
                    1v1 Solo
                  </button>
                  <button
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${type === "TEAM" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"}`}
                    onClick={() => { setType("TEAM"); setSelectedEventId(""); }}
                  >
                    Team vs Team
                  </button>
                </div>

                {type === "TEAM" ? (
                  <div className="space-y-4">
                    {myCapTeams.length === 0 ? (
                      <div className="text-center p-6 bg-secondary/50 rounded-2xl border border-dashed border-border">
                        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground font-medium">Recruit a team first to enter team matchmaking.</p>
                        <Button onClick={() => nav("/teams")} className="mt-4" variant="outline" size="sm">Create a Team</Button>
                      </div>
                    ) : (
                      <>
                        <Select label="Select Your Team" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                          {myCapTeams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.sport})</option>)}
                        </Select>
                        {selectedTeam && (
                          <Select label="Select Event" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                            <option value="">-- Choose Event --</option>
                            {events.filter(e => e.isTeamSport && e.sport === myCapTeams.find(t=>t.id.toString()===selectedTeam)?.sport).map(e => (
                              <option key={e.id} value={e.id}>{e.eventName} ({e.sport})</option>
                            ))}
                          </Select>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select label="Select Event" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                      <option value="">-- Choose Event --</option>
                      {events.filter(e => !e.isTeamSport).map(e => (
                        <option key={e.id} value={e.id}>{e.eventName} ({e.sport})</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="flex justify-center mt-8">
                  <Button size="lg" className="w-full md:w-auto px-12 h-14 text-lg font-black uppercase italic tracking-tighter" onClick={handleFindMatch} disabled={type === "TEAM" && myCapTeams.length === 0}>
                    <Search className="w-6 h-6 mr-2" /> Start Search
                  </Button>
                </div>
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     Our algorithm matches you with opponents of similar skill level (±15 MMR). Ensure your skill levels are updated in your profile for the best experience.
                   </p>
                </div>
              </div>
            )}

            {status === "SEARCHING" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 border-8 border-primary/20 rounded-full animate-ping" />
                  <div className="relative bg-primary/10 p-10 rounded-full border-2 border-primary/20">
                    <Search className="w-16 h-16 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-primary uppercase italic tracking-tighter">Searching...</h2>
                  <p className="text-muted-foreground font-medium italic">Finding a worthy {type === "INDIVIDUAL" ? "opponent" : "team"} for the event</p>
                </div>
                <Button variant="destructive" onClick={handleCancel} className="rounded-full px-8 uppercase font-bold tracking-widest text-xs">
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Search
                </Button>
              </div>
            )}

            {status === "FOUND" && foundMatch && (
              <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in zoom-in duration-500">
                <div className="bg-primary/20 p-6 rounded-full border-4 border-primary/30">
                  <Trophy className="w-20 h-20 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-4xl font-black text-primary uppercase italic tracking-tighter">Match Found!</h2>
                  <p className="text-lg font-bold text-muted-foreground italic">Prepare for Battle</p>
                </div>
                
                <div className="w-full bg-secondary/50 p-8 rounded-3xl border-2 border-primary/20 flex items-center justify-between mt-4 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-destructive"></div>
                  
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-primary truncate uppercase italic">{foundMatch.team1Name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-1">Home</p>
                  </div>
                  <div className="px-8 flex flex-col items-center">
                    <div className="font-black text-4xl text-foreground italic drop-shadow-lg">VS</div>
                    <Badge variant="outline" className="mt-2 text-[10px] uppercase font-bold">Match</Badge>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-destructive truncate uppercase italic">{foundMatch.team2Name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-1">Away</p>
                  </div>
                </div>
                
                <div className="flex gap-4 w-full">
                  <Button className="flex-1 h-14 text-lg font-black uppercase italic" onClick={() => nav("/matches")}>Enter Arena</Button>
                  <Button variant="outline" className="flex-1 h-14 text-lg font-black uppercase italic" onClick={() => setStatus("IDLE")}>Queue Again</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "TEAMS" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end bg-secondary/30 p-6 rounded-2xl border border-border">
              <Select label="Filter Sport" value={filterSport} onChange={(e) => setFilterSport(e.target.value)} className="w-full md:w-64">
                <option value="All">All Sports</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
              </Select>
              <div className="flex-1"></div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Showing {availableTeams.length} available teams
              </p>
            </div>

            {loadingPool ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary animate-pulse rounded-2xl" />)}
              </div>
            ) : availableTeams.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-tighter">No teams found</h3>
                <p className="text-sm text-muted-foreground mt-1 italic">Try selecting a different sport or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTeams.map(team => (
                  <div key={team.id} className="card-nuces p-0 overflow-hidden flex flex-col group hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-6 space-y-4 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 overflow-hidden">
                          {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 text-primary" />}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <Badge className={cn("px-2 py-0.5 text-[10px] uppercase font-black", getSkillBadgeColor(team.skillLevel))}>
                             Skill: {team.skillLevel}
                           </Badge>
                           <Badge variant="secondary" className="text-[10px] uppercase font-black">{team.sport}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter line-clamp-1">{team.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium">Led by <span className="text-primary font-bold">@{team.captainUsername}</span></p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Open Roles:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(team.openSlots).map(([role, count]) => (
                            <div key={role} className="flex items-center gap-1.5 bg-secondary/80 px-2.5 py-1 rounded-lg border border-border">
                              <span className="text-[10px] font-black text-foreground uppercase">{role}</span>
                              <Badge className="h-4 min-w-[1rem] px-1 text-[8px] bg-primary font-black">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/50 border-t border-border mt-auto">
                       <Button 
                         className="w-full font-black uppercase italic tracking-tighter h-11"
                         onClick={() => handleJoinRequest(team.id, team.sport)}
                         disabled={user?.username === team.captainUsername}
                       >
                         {user?.username === team.captainUsername ? "You are Captain" : "Request to Join"}
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "PLAYERS" && (
          <div className="space-y-6">
             <div className="flex flex-wrap gap-4 items-end bg-secondary/30 p-6 rounded-2xl border border-border">
              <Select label="Sport" value={filterSport} onChange={(e) => setFilterSport(e.target.value)} className="w-full md:w-64">
                <option value="All">All Sports</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
              </Select>
              <div className="flex-1"></div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                {playerPool.length} players looking for a squad
              </p>
            </div>

            {loadingPool ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary animate-pulse rounded-2xl" />)}
              </div>
            ) : playerPool.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-tighter">Player Pool Empty</h3>
                <p className="text-sm text-muted-foreground mt-1 italic">No players are currently looking for a team in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playerPool.map(player => (
                  <div key={player.username} className="card-nuces p-0 overflow-hidden flex flex-col group hover:border-primary/50 transition-all hover:shadow-2xl">
                    <div className="p-6 flex items-center gap-4 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="h-16 w-16 bg-background rounded-full border-2 border-primary/20 p-1">
                        {player.profilePicture ? (
                          <img src={player.profilePicture} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl italic uppercase">
                            {player.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                           <h3 className="font-black text-foreground uppercase italic tracking-tighter truncate">{player.name}</h3>
                           <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">@{player.username}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="bg-secondary/50 p-3 rounded-xl border border-border">
                             <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Position</p>
                             <p className="text-xs font-black text-primary uppercase italic">{player.position}</p>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded-xl border border-border">
                             <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Skill MMR</p>
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">{player.skillLevel}</span>
                                <div className={cn("h-2 w-2 rounded-full", player.skillLevel >= 80 ? "bg-green-500" : player.skillLevel >= 40 ? "bg-amber-500" : "bg-red-500")}></div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground italic px-1">
                          <div className="flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5" />
                             Waiting for {formatTimeAgo(player.since)}
                          </div>
                          <Badge variant="outline" className="text-[9px] h-5">{player.sport}</Badge>
                       </div>
                    </div>

                    <div className="p-4 bg-secondary/50 border-t border-border mt-auto">
                       <Button 
                         variant="primary"
                         className="w-full font-black uppercase italic tracking-tighter h-11"
                         onClick={() => handleInvitePlayer(player.username)}
                       >
                         <UserPlus className="w-4 h-4 mr-2" /> Recruit Player
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
