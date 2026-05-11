import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary-light" | "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  "primary-light": "btn-primary-light",
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  destructive: "btn-destructive",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary-light", size = "md", loading, fullWidth, className, children, disabled, ...rest },
  ref
) {
  // Omit motion-conflicting props from the spread
  const { onDrag, onDragStart, onDragEnd, onAnimationStart, ...safeRest } = rest as any;

  return (
    <motion.button
      ref={ref as any}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      disabled={disabled || loading}
      className={cn(variantClass[variant], sizeClass[size], fullWidth && "w-full", className)}
      {...safeRest}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{loading ? "Please wait..." : children}</span>
      </div>
    </motion.button>
  );
});
