import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Upload, Activity, Trophy, XCircle, Target, UserCheck, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, getAnalytics, updatePassword, updateProfilePicture, updateUsername, updateEmail, deleteAccount } from "@/lib/services";
import type { Profile as ProfileT } from "@/types";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { Skeleton } from "@/components/common/Skeleton";
import { fileToBase64, getErrorMessage } from "@/lib/utils";
import { ImageCropperModal } from "@/components/common/ImageCropperModal";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [selectedSport, setSelectedSport] = useState("Football");
  const [skillLevel, setSkillLevel] = useState(50);
  const [position, setPosition] = useState("Goalkeeper");
  const [busy, setBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [cropFileSrc, setCropFileSrc] = useState<string | null>(null);

  const getPositionsForSport = (sport: string) => {
    if (sport === "Cricket") return ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
    if (sport === "Football") return ["Goalkeeper", "Defender", "Midfielder", "Forward"];
    if (sport === "Basketball") return ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"];
    if (sport === "Volleyball") return ["Setter", "Outside Hitter", "Opposite Hitter", "Middle Blocker", "Libero"];
    return ["Other"];
  };

  const load = async () => {
    if (!user) return;
    try { 
      const [p, a] = await Promise.all([getProfile(user.username), getAnalytics(user.username)]); 
      setProfile(p); 
      setNewUsername(p.username); 
      setNewEmail(p.email || "");
      setSkillLevel(p.skills?.[selectedSport] || 50);
      setPosition(p.preferredPositions?.[selectedSport] || getPositionsForSport(selectedSport)[0]);
      setAnalytics(a);
    }
    catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  useEffect(() => {
    if (profile) {
      setSkillLevel(profile.skills?.[selectedSport] || 50);
      setPosition(profile.preferredPositions?.[selectedSport] || getPositionsForSport(selectedSport)[0]);
    }
  }, [selectedSport, profile]);

  const onPic = async (f?: File) => {
    if (!f || !user) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Under 5 MB");
    try {
      const b64 = await fileToBase64(f);
      setCropFileSrc(b64);
    } catch (e) { toast.error("Failed to read image"); }
  };
  
  const onCropConfirm = async (b64: string) => {
    if (!user) return;
    setCropFileSrc(null);
    try { await updateProfilePicture(user.username, b64); setUser({ ...user, profilePicture: b64 }); toast.success("Picture updated"); load(); }
    catch (e) { toast.error(getErrorMessage(e)); }
  };
  const removePic = async () => {
    if (!user) return;
    try { await updateProfilePicture(user.username, null); setUser({ ...user, profilePicture: undefined }); toast.success("Picture removed"); load(); }
    catch (e) { toast.error(getErrorMessage(e)); }
  };

  const saveUsername = async () => {
    if (!user) return; setBusy(true);
    try {
      const r = await updateUsername(user.username, newUsername.trim());
      setUser({ ...user, username: r.username });
      toast.success("Username updated"); load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const saveEmail = async () => {
    if (!user) return; setBusy(true);
    try {
      await updateEmail(user.username, newEmail.trim());
      toast.success("Email updated and welcome message sent!"); load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const saveSkillLevel = async () => {
    if (!user) return; setBusy(true);
    try {
      const { updateUserSkillLevel, updateUserPosition } = await import("@/lib/services");
      await Promise.all([
        updateUserSkillLevel(user.username, selectedSport, skillLevel),
        updateUserPosition(user.username, selectedSport, position)
      ]);
      toast.success(`${selectedSport} profile updated`); load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const togglePool = async () => {
    if (!user || !profile) return; setBusy(true);
    const active = !profile.lookingForTeamSport;
    try {
      const { togglePlayerPool } = await import("@/lib/services");
      await togglePlayerPool(user.username, { sport: selectedSport, position, active });
      toast.success(active ? "Entered player pool" : "Left player pool"); load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const savePw = async () => {
    if (!user) return; setBusy(true);
    try { await updatePassword(user.username, oldPw, newPw); toast.success("Password updated"); setOldPw(""); setNewPw(""); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const doDelete = async () => {
    if (!user) return; setBusy(true);
    try { await deleteAccount(user.username, delPw); toast.success("Account deleted"); logout(); nav("/"); }
    catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  if (!profile) return <Skeleton className="h-60" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account.</p>
      </div>

      <div className="card-nuces p-6 flex items-center gap-4">
        {profile.profilePicture ? (
          <img src={profile.profilePicture} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">{profile.name[0]}</div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-primary">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.username} · {profile.role}</p>
          <div className="flex gap-2 mt-3">
            <label className="btn-outline cursor-pointer"><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => onPic(e.target.files?.[0])} /></label>
            {profile.profilePicture && <Button variant="outline" onClick={removePic}><Trash2 className="h-4 w-4" /> Remove</Button>}
          </div>
        </div>
      </div>

      <div className="card-nuces p-6 space-y-3">
        <h2 className="font-semibold text-primary">Change username</h2>
        <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
        <div className="flex justify-end"><Button onClick={saveUsername} loading={busy} disabled={!newUsername.trim() || newUsername === profile.username}>Save</Button></div>
      </div>

      <div className="card-nuces p-6 space-y-3">
        <h2 className="font-semibold text-primary">Email Address</h2>
        <p className="text-sm text-muted-foreground">Receive important notifications at this email address.</p>
        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="example@email.com" />
        <div className="flex justify-end"><Button onClick={saveEmail} loading={busy} disabled={!newEmail.trim() || newEmail === profile.email || !newEmail.includes('@')}>Save Email</Button></div>
      </div>

      {profile.role === "PLAYER" && (
        <div className="card-nuces p-6 space-y-3">
          <h2 className="font-semibold text-primary">Matchmaking Skill Level</h2>
          <p className="text-sm text-muted-foreground">Adjust your skill level (1-100) per sport to find opponents of similar skill in the matchmaking queue.</p>
          
          <Select label="Select Sport" value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}>
             <option value="Football">Football</option>
             <option value="Basketball">Basketball</option>
             <option value="Cricket">Cricket</option>
             <option value="Volleyball">Volleyball</option>
          </Select>

          <div className="flex items-center gap-4 mt-2">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={skillLevel} 
              onChange={(e) => setSkillLevel(Number(e.target.value))} 
              className="flex-1 accent-primary" 
            />
            <span className="font-bold text-lg w-8 text-center">{skillLevel}</span>
          </div>

          <Select label="Preferred Position" value={position} onChange={(e) => setPosition(e.target.value)}>
            {getPositionsForSport(selectedSport).map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </Select>

          <div className="flex justify-end gap-2">
            <Button 
              variant={profile.lookingForTeamSport ? "destructive" : "outline"} 
              onClick={togglePool} 
              loading={busy}
            >
              {profile.lookingForTeamSport ? "Leave Pool" : "Looking for Team"}
            </Button>
            <Button onClick={saveSkillLevel} loading={busy} disabled={profile && skillLevel === (profile.skills?.[selectedSport] || 50) && position === (profile.preferredPositions?.[selectedSport] || getPositionsForSport(selectedSport)[0])}>
              Update {selectedSport} profile
            </Button>
          </div>
          {profile.lookingForTeamSport && (
            <p className="text-xs text-primary font-medium text-center mt-2 animate-pulse">
              Currently in pool for {profile.lookingForTeamSport} ({profile.lookingForTeamPosition})
            </p>
          )}
        </div>
      )}

      {analytics && profile.role === "PLAYER" && (
        <div className="card-nuces p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-primary">Participation Analytics</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Target className="h-6 w-6 text-primary mb-2" />
              <span className="text-3xl font-extrabold text-foreground">{analytics.totalMatches}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Matches</span>
            </div>
            
            <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Trophy className="h-6 w-6 text-green-500 mb-2" />
              <span className="text-3xl font-extrabold text-foreground">{analytics.wins}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Wins</span>
            </div>

            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-red-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <XCircle className="h-6 w-6 text-red-500 mb-2" />
              <span className="text-3xl font-extrabold text-foreground">{analytics.losses}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Losses</span>
            </div>

            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Flame className="h-6 w-6 text-amber-500 mb-2" />
              <span className="text-3xl font-extrabold text-foreground">{analytics.winRate}%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Win Rate</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
             <div className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-transparent hover:border-border">
                <span className="text-sm font-medium flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /> Casual Matches</span>
                <span className="font-bold text-lg">{analytics.casualMatches}</span>
             </div>
             <div className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-lg border border-transparent hover:border-border">
                <span className="text-sm font-medium flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Tournament Matches</span>
                <span className="font-bold text-lg">{analytics.tournamentMatches}</span>
             </div>
          </div>
        </div>
      )}

      <div className="card-nuces p-6 space-y-3">
        <h2 className="font-semibold text-primary">Change password</h2>
        <Input type="password" label="Current password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
        <Input type="password" label="New password" hint="At least 8 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        <div className="flex justify-end"><Button onClick={savePw} loading={busy} disabled={!oldPw || newPw.length < 8}>Update password</Button></div>
      </div>

      {profile.role !== "ADMIN" && (
        <div className="card-nuces p-6 border-l-destructive">
          <h2 className="font-semibold text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mt-1">Delete your account permanently.</p>
          <Button variant="destructive" className="mt-3" onClick={() => setDelOpen(true)}><Trash2 className="h-4 w-4" /> Delete account</Button>
        </div>
      )}

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Delete account" description="This action is permanent."
        footer={<><Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button><Button variant="destructive" disabled={!delPw} onClick={doDelete} loading={busy}>Delete</Button></>}>
        <Input type="password" label="Confirm password" value={delPw} onChange={(e) => setDelPw(e.target.value)} />
      </Modal>

      <ImageCropperModal 
        open={!!cropFileSrc} 
        imageSrc={cropFileSrc || ""} 
        onClose={() => setCropFileSrc(null)} 
        onCrop={onCropConfirm} 
      />
    </div>
  );
}
