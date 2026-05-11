import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, approveNotification, rejectNotification, getRegistrationRequests, approveRegistrationRequest, rejectRegistrationRequest } from "@/lib/services";
import type { Notification } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/lib/utils";

export default function Approvals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [regItems, setRegItems] = useState<any[] | null>(null);

  const load = async () => {
    if (!user) return;
    try { 
      const r = await getNotifications(user.username); setItems(r.notifications.filter((n) => n.isPending)); 
      const regs = await getRegistrationRequests(user.username); setRegItems(regs);
    }
    catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  const act = async (id: number, approve: boolean) => {
    if (!user) return;
    try {
      await (approve ? approveNotification(id, user.username) : rejectNotification(id, user.username));
      toast.success(approve ? "Approved & broadcast" : "Rejected"); load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const actReg = async (id: number, approve: boolean) => {
    if (!user) return;
    try {
      await (approve ? approveRegistrationRequest(id, user.username) : rejectRegistrationRequest(id, user.username));
      toast.success(approve ? "Registration Approved" : "Registration Rejected"); load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Pending approvals</h1>
        <p className="text-sm text-muted-foreground">Notification and Registration requests submitted by users.</p>
      </div>
      
      {!regItems ? <Skeleton className="h-40" /> : regItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-primary">Registration Requests</h2>
          {regItems.map((r) => (
            <div key={r.id} className="card-nuces p-4 border border-gold">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-primary">@{r.username}</p>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {r.joinType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Event: <strong>{r.eventName}</strong></p>
                  {r.teamName && <p className="text-xs text-muted-foreground mt-1">Team: <strong>{r.teamName}</strong></p>}
                  {r.autoFill && <p className="text-xs text-gold font-bold mt-1">Auto-fill requested for missing slots.</p>}
                  {r.fee > 0 && <p className="text-xs font-semibold text-muted-foreground mt-1">Fee: Rs {r.fee}</p>}
                </div>
                {r.paymentProof && (
                  <a href={r.paymentProof} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    View Payment Proof
                  </a>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => actReg(r.id, true)}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => actReg(r.id, false)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!items ? <Skeleton className="h-40" /> : items.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-primary">Notification Requests</h2>
          {items.map((n) => (
            <div key={n.id} className="card-nuces p-4">
              <p className="font-semibold text-primary">{n.title}</p>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{n.body}</p>
              <p className="text-[11px] text-muted-foreground mt-2">Requested by <strong>{n.sender}</strong></p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => act(n.id, true)}>Approve & broadcast</Button>
                <Button size="sm" variant="outline" onClick={() => act(n.id, false)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items?.length === 0 && regItems?.length === 0 && (
        <EmptyState icon={<ShieldCheck className="h-6 w-6" />} title="Nothing to review" description="All caught up." />
      )}
    </div>
  );
}
