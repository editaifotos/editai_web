"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const REASON_MESSAGES: Record<string, { title: string; description: string }> =
  {
    canceled: {
      title: "Pagamento cancelado",
      description:
        "Você cancelou o processo de pagamento. Se foi por engano, você pode tentar novamente.",
    },
    expired: {
      title: "Link expirado",
      description:
        "O tempo para realizar o pagamento expirou. Por favor, inicie o processo novamente.",
    },
    default: {
      title: "Pagamento não concluído",
      description:
        "Não foi possível concluir seu pagamento. Verifique os dados do cartão e tente novamente.",
    },
  };

function RecuseCheckoutContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "default";
  const { title, description } =
    REASON_MESSAGES[reason] ?? REASON_MESSAGES.default;

  const planId = searchParams.get("planId") ?? searchParams.get("plan_id");

  return (
    <Card className="w-full max-w-md bg-surface p-8 shadow-lg text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error text-3xl">
        ✕
      </div>
      <h1 className="text-2xl font-semibold text-primary">{title}</h1>
      <p className="text-sm text-secondary">{description}</p>
      <div className="space-y-3 pt-2">
        <Link
          href={planId ? `/checkout?planId=${planId}` : "/checkout"}
          className="block"
        >
          <Button size="lg" className="w-full">
            Tentar novamente
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="secondary" size="lg" className="w-full">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function RecuseCheckoutPage() {
  return (
    <main className="bg-app">
      <section className="flex min-h-[calc(100vh-4rem)] items-center py-12 md:py-20">
        <Container className="flex justify-center">
          <Suspense
            fallback={
              <Card className="w-full max-w-md bg-surface p-8 shadow-lg">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-48 rounded-lg bg-surface-2 mx-auto" />
                  <div className="h-4 w-64 rounded-lg bg-surface-2 mx-auto" />
                  <div className="h-12 rounded-full bg-surface-2 w-full" />
                </div>
              </Card>
            }
          >
            <RecuseCheckoutContent />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
