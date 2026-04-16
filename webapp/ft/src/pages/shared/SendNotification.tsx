import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createNotification } from "@/lib/services";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(1, "Required").max(100),
  body: z.string().trim().min(1, "Required").max(2000),
});
type Form = z.infer<typeof schema>;

export default function SendNotification() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    if (!user) return;
    setBusy(true);
    try {
      await createNotification({ senderUsername: user.username, ...data });
      toast.success(user.role === "ADMIN" ? "Broadcast sent" : "Submitted for admin approval");
      reset();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{user?.role === "ADMIN" ? "Broadcast notification" : "Send notification request"}</h1>
        <p className="text-sm text-muted-foreground">{user?.role === "ADMIN" ? "Goes to all users immediately." : "Admins must approve before it broadcasts."}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card-nuces p-6 space-y-4">
        <Input label="Title" placeholder="e.g. Cricket finals rescheduled" error={errors.title?.message} {...register("title")} />
        <Textarea label="Message" placeholder="Write your message…" error={errors.body?.message} {...register("body")} />
        <div className="flex justify-end"><Button type="submit" loading={busy}>{user?.role === "ADMIN" ? "Broadcast" : "Submit for approval"}</Button></div>
      </form>
    </div>
  );
}
