import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createEvent } from "@/lib/services";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import { fileToBase64, getErrorMessage } from "@/lib/utils";

const schema = z.object({
  eventName: z.string().trim().min(1, "Required").max(120),
  sport: z.string().trim().min(1, "Required").max(60),
  fee: z.coerce.number().min(0, "≥ 0").default(0),
  isTeamSport: z.boolean().default(false),
  duration: z.string().max(60).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalSlots: z.coerce.number().int().min(1, "≥ 1"),
  tournamentType: z.string().max(60).optional(),
  teamCap: z.coerce.number().int().min(1).optional().or(z.literal("").transform(() => undefined)),
  minRequired: z.coerce.number().int().min(1).optional().or(z.literal("").transform(() => undefined)),
});
type Form = z.infer<typeof schema>;

export default function EventForm() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [picture, setPicture] = useState<string>("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { isTeamSport: false, fee: 0, totalSlots: 16 },
  });
  const isTeam = watch("isTeamSport");

  const onSubmit = async (data: Form) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createEvent({ ...data, picture, createdBy: user.username });
      toast.success("Event created");
      nav("/events");
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setSubmitting(false); }
  };

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 1024 * 1024) { toast.error("Image must be under 1 MB"); return; }
    const b64 = await fileToBase64(f);
    setPicture(b64);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/events" className="btn-ghost -ml-2 inline-flex"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Create event</h1>
        <p className="text-sm text-muted-foreground">Fill in the tournament details below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-nuces p-6 space-y-4">
        <Input label="Event name (required)" placeholder="e.g. Cricket Championship 2025" error={errors.eventName?.message} {...register("eventName")} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Sport (required)" error={errors.sport?.message} {...register("sport")}>
            <option value="">Select sport…</option>
            {["Football", "Cricket", "Basketball", "Volleyball", "Table Tennis", "Badminton"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Input label="Fee (PKR) (required)" type="number" min={0} step="any" error={errors.fee?.message} {...register("fee")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input type="date" label="Start date (optional)" error={errors.startDate?.message} {...register("startDate")} />
          <Input type="date" label="End date (optional)" error={errors.endDate?.message} {...register("endDate")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Duration (optional)" placeholder="e.g. 5 days" error={errors.duration?.message} {...register("duration")} />
          <Select label="Tournament type (optional)" {...register("tournamentType")}>
            <option value="">Select type…</option>
            <option>Knockout</option>
            <option>League</option>
            <option>Round Robin</option>
            <option>Group Stage + Knockout</option>
          </Select>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Total slots (required)" type="number" min={1} error={errors.totalSlots?.message} {...register("totalSlots")} />
          <Input label="Team cap (optional)" type="number" min={1} hint={isTeam ? "Players per team" : "Only for team sports"} error={errors.teamCap?.message} {...register("teamCap")} />
          <Input label="Min required (optional)" type="number" min={1} hint={isTeam ? "Min players to register a team" : "Only for team sports"} error={errors.minRequired?.message} {...register("minRequired")} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register("isTeamSport")} className="h-4 w-4" />
          <span>This is a team sport (click if yes)</span>
        </label>
        <div>
          <label className="label-field">Cover image (optional, ≤ 1 MB)</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="block w-full text-sm" />
          {picture && <img src={picture} alt="preview" className="mt-3 h-32 rounded-md object-cover border border-border" />}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link to="/events" className="btn-outline">Cancel</Link>
          <Button type="submit" loading={submitting}>Create event</Button>
        </div>
      </form>
    </div>
  );
}
