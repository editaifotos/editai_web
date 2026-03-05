import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "./container";

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Section({
  title,
  subtitle,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 md:py-20", className)} {...props}>
      <Container>
        {(title || subtitle) && (
          <header className="mb-8 max-w-2xl">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-secondary md:text-base">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

