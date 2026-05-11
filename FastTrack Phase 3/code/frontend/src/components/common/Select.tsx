import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, id, children, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label-field">{label}</label>}
      <select ref={ref} id={inputId} className={cn("input-field bg-background", className)} {...rest}>
        {children}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
