import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label-field">{label}</label>}
      <textarea ref={ref} id={inputId} className={cn("input-field min-h-[90px] resize-y", className)} {...rest} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
