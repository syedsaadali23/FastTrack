import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserCheck, XCircle, Shield, Activity, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, getAnalytics, getTeamComposition, resolveJoinRequest } from "@/lib/services";
import type { Profile } from "@/types";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { getErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/common/Skeleton";

export default function ReviewJoinRequest() {
  const { user } = useAuth();
  const { teamId, username: requesterUsername } = useParams();
  const nav = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [composition, setComposition] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (requesterUsername && teamId) {
      loadData();
    }
  }, [requesterUsername, teamId]);

  const loadData = async () => {
    try {
      const [p, a, c] = await Promise.all([
        getProfile(requesterUsername!),
        getAnalytics(requesterUsername!),
        getTeamComposition(Number(teamId))
      ]);
      setProfile(p);
      setAnalytics(a);
      setComposition(c);
    } catch (e) {
      toast.error(getErrorMessage(e));
      nav("/notifications");
    }
  };

  const handleResolve = async (approve: boolean) => {
    if (!user || !teamId || !requesterUsername) return;
    setBusy(true);
    try {
      await resolveJoinRequest(Number(teamId), {
        username: user.username,
        requester: requesterUsername,
        approve
      });
      toast.success(approve ? "Player added to team!" : "Request rejected.");
      nav("/notifications");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!profile || !analytics || !composition) return (
    <div className="space-y-6 max-w-4xl mx-auto py-12">
       <Skeleton className="h-12 w-1/3" />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 md:col-span-2" />
       </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-primary uppercase italic tracking-tighter">Review Request</h1>
           <p className="text-sm text-muted-foreground font-medium italic">Join request for your team</p>
        </div>
        <Button variant="outline" onClick={() => nav(-1)} size="sm" className="font-bold uppercase tracking-widest text-[10px]">Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Sidebar */}
        <div className="space-y-6">
          <div className="card-nuces p-0 overflow-hidden text-center">
            <div className="h-24 bg-gradient-to-br from-primary to-primary/60"></div>
            <div className="-mt-12 px-6 pb-6">
              <div className="inline-block h-24 w-24 rounded-full border-4 border-background bg-secondary p-1 shadow-xl mb-4">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black italic">{profile.name[0]}</div>
                )}
              </div>
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{profile.name}</h2>
              <p className="text-sm text-muted-foreground font-bold mb-4">@{profile.username}</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                 {Object.entries(profile.preferredPositions).map(([sport, pos]) => (
                    <Badge key={sport} variant="secondary" className="text-[9px] uppercase font-black px-2">
                      {sport}: {pos}
                    </Badge>
                 ))}
              </div>
            </div>
          </div>

          <div className="card-nuces p-6 space-y-4">
             <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
               <Shield className="w-4 h-4" /> Team Context
             </h3>
             <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                   <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Target Slot</p>
                   <p className="text-sm font-black text-primary uppercase italic">
                     {profile.preferredPositions[composition.sport] || "Squad Member"}
                   </p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                   <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Current Availability</p>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {composition.remaining[profile.preferredPositions[composition.sport]] || 0} Slots Left
                      </span>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Analytics & Stats */}
        <div className="md:col-span-2 space-y-6">
           <div className="card-nuces p-6 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Performance Stats
                 </h3>
                 <BadgeCheck className="w-6 h-6 text-primary" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Matches</p>
                    <p className="text-2xl font-black text-foreground italic">{analytics.totalMatches}</p>
                 </div>
                 <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Wins</p>
                    <p className="text-2xl font-black text-green-500 italic">{analytics.wins}</p>
                 </div>
                 <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Losses</p>
                    <p className="text-2xl font-black text-red-500 italic">{analytics.losses}</p>
                 </div>
                 <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-center">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-2xl font-black text-amber-500 italic">{analytics.winRate}%</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Skill MMR Distribution</h4>
                 <div className="space-y-3">
                    {Object.entries(profile.skills).map(([sport, level]) => (
                       <div key={sport} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-tighter italic">
                             <span>{sport}</span>
                             <span className="text-primary">{level} MMR</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary transition-all duration-1000" 
                               style={{ width: `${level}%` }}
                             ></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Action Buttons */}
           <div className="flex gap-4">
              <Button 
                variant="destructive" 
                className="flex-1 h-14 text-lg font-black uppercase italic tracking-tighter"
                onClick={() => handleResolve(false)}
                disabled={busy}
              >
                <XCircle className="w-6 h-6 mr-2" /> Reject Player
              </Button>
              <Button 
                className="flex-1 h-14 text-lg font-black uppercase italic tracking-tighter"
                onClick={() => handleResolve(true)}
                loading={busy}
              >
                <UserCheck className="w-6 h-6 mr-2" /> Approve & Sign
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
