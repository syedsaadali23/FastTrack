import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, rightSlot, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label-field">{label}</label>}
      <div className="relative group">
        <input 
          ref={ref} 
          id={inputId} 
          className={cn(
            "input-field h-11 border border-border shadow-sm transition-all duration-300 focus:shadow-md focus:shadow-primary/10", 
            rightSlot && "pr-10", 
            error && "border-destructive focus:ring-destructive",
            className
          )} 
          {...rest} 
        />
        {rightSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">{rightSlot}</div>}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="field-error flex items-center gap-1 mt-1.5 font-medium"
        >
          {error}
        </motion.p>
      )}
      {!error && hint && <p className="text-xs text-muted-foreground mt-1.5 opacity-80">{hint}</p>}
    </div>
  );
});
