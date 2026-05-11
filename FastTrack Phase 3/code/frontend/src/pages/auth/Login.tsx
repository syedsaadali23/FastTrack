import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { DualLogos } from "@/components/common/DualLogos";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  username: z.string().trim().min(1, "Username is required").max(64),
  password: z.string().min(1, "Password is required").max(128),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      await login(data.username, data.password);
      toast.success("Welcome back!");
      nav(loc.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid username or password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <DualLogos nucesHeight={40} fssHeight={44} crossSize={22} variant="light" />
          <h1 className="text-[22px] font-bold text-primary mt-3">FastTrack</h1>
          <p className="text-[13px] text-muted-foreground">Sign in to your sports portal</p>
        </div>
        <hr className="my-5 border-border" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Username" placeholder="Your username" autoComplete="username" error={errors.username?.message} {...register("username")} />
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            rightSlot={
              <button type="button" onClick={() => setShowPw((v) => !v)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="toggle">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
          <Button type="submit" fullWidth loading={submitting}>Login</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary-light font-medium hover:underline">Sign up</Link>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Forgot password? Contact an administrator for assistance.
        </p>
      </div>
    </div>
  );
}
