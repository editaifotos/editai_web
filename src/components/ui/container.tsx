import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

