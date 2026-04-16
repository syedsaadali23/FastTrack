import { useEffect, useState } from "react";
import { CheckCheck, Bell } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead, approveNotification, rejectNotification } from "@/lib/services";
import type { Notification } from "@/types";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { cn, getErrorMessage } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    try { const r = await getNotifications(user.username); setItems(r.notifications); setUnread(r.unreadCount); }
    catch (e) { toast.error(getErrorMessage(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.username]);

  const handleRead = async (n: Notification) => { if (n.isRead || !user) return; try { await markNotificationRead(n.id, user.username); load(); } catch {} };
  const handleAll = async () => { if (!user) return; setBusy(true); try { await markAllNotificationsRead(user.username); toast.success("All marked as read"); load(); } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); } };
  const handleApprove = async (id: number) => { if (!user) return; try { await approveNotification(id, user.username); toast.success("Approved & broadcast"); load(); } catch (e) { toast.error(getErrorMessage(e)); } };
  const handleReject = async (id: number) => { if (!user) return; try { await rejectNotification(id, user.username); toast.success("Rejected"); load(); } catch (e) { toast.error(getErrorMessage(e)); } };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread</p>
        </div>
        {(items?.length ?? 0) > 0 && <Button variant="outline" onClick={handleAll} loading={busy}><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
      </div>
      {!items ? <Skeleton className="h-40" /> : items.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="You're all caught up" description="No notifications yet." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} onClick={() => handleRead(n)} className={cn("rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30", !n.isRead && "bg-primary/5")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-primary">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">from {n.sender} {n.isPending && <span className="badge badge-postponed ml-2">Pending approval</span>}</p>
                </div>
                {!n.isRead && <span className="h-2 w-2 mt-2 rounded-full bg-destructive shrink-0" />}
              </div>
              {user?.role === "ADMIN" && n.isPending && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApprove(n.id); }}>Approve & broadcast</Button>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleReject(n.id); }}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
