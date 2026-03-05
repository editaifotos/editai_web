import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  highlighted?: boolean;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ highlighted, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke bg-surface shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg",
        highlighted && "border-brand shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
