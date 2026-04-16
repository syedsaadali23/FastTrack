import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, approveNotification, rejectNotification } from "@/lib/services";
import type { Notification } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/lib/utils";

export default function Approvals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const load = async () => {
    if (!user) return;
    try { const r = await getNotifications(user.username); setItems(r.notifications.filter((n) => n.isPending)); }
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Pending approvals</h1>
        <p className="text-sm text-muted-foreground">Notification requests submitted by organizers.</p>
      </div>
      {!items ? <Skeleton className="h-40" /> : items.length === 0 ? (
        <EmptyState icon={<ShieldCheck className="h-6 w-6" />} title="Nothing to review" description="All caught up." />
      ) : (
        <div className="space-y-3">
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
    </div>
  );
}
