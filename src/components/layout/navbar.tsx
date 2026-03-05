"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/#planos", label: "Planos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-default bg-surface-glass backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-md">
            E
          </span>
          <span className="text-base font-semibold tracking-tight text-primary md:text-lg">
            Editai
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-secondary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/criar_conta">
            <Button size="sm" className="ml-2">Criar conta</Button>
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-default bg-surface text-primary shadow-sm"
          >
            {open ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-default bg-surface-glass backdrop-blur-md md:hidden">
          <Container className="flex flex-col gap-2 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-2 text-sm font-medium text-secondary transition-colors hover:bg-canvas hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/criar_conta" onClick={() => setOpen(false)}>
              <Button size="md" className="mt-1 w-full">Criar conta</Button>
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
