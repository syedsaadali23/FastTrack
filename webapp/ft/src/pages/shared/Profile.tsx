import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updatePassword, updateProfilePicture, updateUsername, deleteAccount } from "@/lib/services";
import type { Profile as ProfileT } from "@/types";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Skeleton } from "@/components/common/Skeleton";
import { fileToBase64, getErrorMessage } from "@/lib/utils";
import { ImageCropperModal } from "@/components/common/ImageCropperModal";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [cropFileSrc, setCropFileSrc] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    try { const p = await getProfile(user.username); setProfile(p); setNewUsername(p.username); }
    catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

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
