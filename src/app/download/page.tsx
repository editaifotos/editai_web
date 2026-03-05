"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

type Platform = "android" | "ios" | "desktop" | null;

/* ─── Links das lojas (substituir quando disponíveis) ─── */
const PLAY_STORE_URL = "#";
const APP_STORE_URL = "#";

/* ─── Ícone Google Play ─── */
function IconPlayStore() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.18 23.76a2 2 0 0 1-.89-.22 2.06 2.06 0 0 1-1.09-1.83V2.29A2.06 2.06 0 0 1 2.29.46a2 2 0 0 1 2 .17l13.09 7.56-2.7 2.7-11.5-6.64v15.5l11.5-6.64 2.7 2.7L4.25 23.57a2 2 0 0 1-1.07.19z" />
      <path d="M20.29 14.67 17 12.87l-2.9 2.9 3.07 1.77a1.29 1.29 0 0 0 1.27 0l1.85-1.07a.73.73 0 0 0 0-1.27z" />
      <path d="m14.1 11.97 2.9-2.9-8.28-4.78L6 7l8.1 4.97z" />
      <path d="M6 17l2.72 2.72 8.28-4.78-2.9-2.9L6 17z" />
    </svg>
  );
}

/* ─── Ícone App Store ─── */
function IconAppStore() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/* ─── Botão de loja estilizado ─── */
function StoreButton({
  href,
  icon,
  label,
  sublabel,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-3 rounded-full border border-default bg-surface px-6 py-3 text-primary shadow-sm transition-all duration-150 hover:scale-[1.02] hover:border-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:w-auto"
    >
      <span className="flex-shrink-0 text-brand">{icon}</span>
      <span className="text-left">
        <span className="block text-[10px] font-medium uppercase tracking-widest text-secondary">
          {sublabel}
        </span>
        <span className="block text-base font-semibold leading-tight">{label}</span>
      </span>
    </a>
  );
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) setPlatform("android");
    else if (/iPad|iPhone|iPod/i.test(ua)) setPlatform("ios");
    else setPlatform("desktop");
  }, []);

  const showAndroid = platform === null || platform === "android" || platform === "desktop";
  const showIOS = platform === null || platform === "ios" || platform === "desktop";

  return (
    <main className="bg-app">
      <section className="flex min-h-[calc(100vh-4rem)] items-center py-12 md:py-20">
        <Container className="flex justify-center">
          <Card className="w-full max-w-lg bg-surface p-8 shadow-lg md:p-12">

            {/* Ícone do app */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand text-2xl font-bold text-white shadow-lg">
                E
              </div>
            </div>

            {/* Badge */}
            <div className="mt-5 flex justify-center">
              <span className="rounded-full border border-brand/30 bg-brand/5 px-4 py-1 text-xs font-semibold tracking-wide text-brand">
                Disponível para Android e iOS
              </span>
            </div>

            {/* Copy */}
            <div className="mt-6 space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                Seu app está pronto para usar
              </h1>
              <p className="text-sm text-secondary md:text-base">
                Baixe o Editai e comece a criar fotos incríveis com IA agora mesmo.
              </p>
            </div>

            {/* Botões das lojas */}
            <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center">
              {showAndroid && (
                <StoreButton
                  href={PLAY_STORE_URL}
                  icon={<IconPlayStore />}
                  sublabel="Disponível no"
                  label="Google Play"
                />
              )}
              {showIOS && (
                <StoreButton
                  href={APP_STORE_URL}
                  icon={<IconAppStore />}
                  sublabel="Baixar na"
                  label="App Store"
                />
              )}
            </div>

            {/* Divisor e voltar */}
            <div className="mt-8 border-t border-default pt-6 text-center">
              <p className="text-xs text-tertiary">
                Conta criada com sucesso ✓ &nbsp;·&nbsp;{" "}
                <Link href="/" className="font-medium text-brand hover:underline">
                  Voltar ao início
                </Link>
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
