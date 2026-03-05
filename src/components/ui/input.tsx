import type { InputHTMLAttributes } from "react";

type InputProps = {
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-default bg-surface px-3 py-2 text-sm text-primary shadow-sm outline-none transition-colors duration-150 placeholder:text-tertiary focus:border-brand focus:ring-2 focus:ring-brand/40",
          error && "border-error focus:ring-error/40",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

