import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { DualLogos } from "@/components/common/DualLogos";
import { registerRequest } from "@/lib/services";
import { getErrorMessage } from "@/lib/utils";

const baseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  username: z.string().trim().min(3, "At least 3 characters").max(40),
  password: z.string().min(8, "At least 8 characters").max(128),
  role: z.enum(["PLAYER", "ORGANIZER"]),
  rollNumber: z.string().optional(),
  adminCode: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.role === "PLAYER") {
    if (!v.rollNumber || !/^(22|23|24|25|26)L\d{4}$/.test(v.rollNumber.trim())) {
      ctx.addIssue({ code: "custom", path: ["rollNumber"], message: "Format: e.g. 24L1234 (batch 22–26)" });
    }
  } else if (v.role === "ORGANIZER") {
    if (!v.adminCode || v.adminCode.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["adminCode"], message: "Admin-issued code is required" });
    }
  }
});

type Form = z.infer<typeof baseSchema>;

function passwordStrength(p: string): { score: number; label: string; color: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length >= 12) s++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-amber-500", "bg-accent-green", "bg-accent-green"];
  return { score: s, label: labels[s] || "Weak", color: colors[s] || "bg-destructive" };
}

export default function Signup() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(baseSchema),
    defaultValues: { role: "PLAYER" },
  });

  const role = watch("role");
  const pw = watch("password") || "";
  const strength = useMemo(() => passwordStrength(pw), [pw]);

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        name: data.name.trim(),
        username: data.username.trim(),
        password: data.password,
        role: data.role,
      };
      if (data.role === "PLAYER") payload.rollNumber = (data.rollNumber || "").trim();
      if (data.role === "ORGANIZER") payload.adminCode = (data.adminCode || "").trim();
      await registerRequest(payload);
      toast.success("Account created — please log in");
      nav("/login", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create account"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <DualLogos nucesHeight={40} fssHeight={44} crossSize={22} variant="light" />
          <h1 className="text-[22px] font-bold text-primary mt-3">Create your account</h1>
          <p className="text-[13px] text-muted-foreground">Join the FastTrack sports community</p>
        </div>
        <hr className="my-5 border-border" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
          <Input label="Username" placeholder="Choose a username" autoComplete="username" error={errors.username?.message} {...register("username")} />
          <Select label="Role" {...register("role")}>
            <option value="PLAYER">Player</option>
            <option value="ORGANIZER">Organizer</option>
          </Select>
          {role === "PLAYER" && (
            <Input label="Roll number" placeholder="e.g. 24L1234" hint="Batches 22 through 26" error={errors.rollNumber?.message} {...register("rollNumber")} />
          )}
          {role === "ORGANIZER" && (
            <Input label="Admin-issued code" placeholder="Provided by admin" error={errors.adminCode?.message} {...register("adminCode")} />
          )}
          <div>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              rightSlot={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="toggle">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />
            {pw && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Strength: {strength.label}</p>
              </div>
            )}
          </div>
          <Button type="submit" fullWidth loading={submitting}>Create account</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-light font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
