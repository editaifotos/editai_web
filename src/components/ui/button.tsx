import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.02]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-brand text-white hover:bg-brand-dark shadow-md",
  secondary: "bg-surface text-primary border border-default hover:border-brand hover:text-brand-dark",
  ghost:     "bg-transparent text-primary hover:bg-surface-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}
