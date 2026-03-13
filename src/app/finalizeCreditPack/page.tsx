"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinalizeCreditPackPage() {
  return (
    <main className="bg-app">
      <section className="flex min-h-[calc(100vh-4rem)] items-center py-12 md:py-20">
        <Container className="flex justify-center">
          <Card className="w-full max-w-md bg-surface p-8 shadow-lg text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-semibold text-primary">
              Compra confirmada
            </h1>
            <p className="text-sm text-secondary">
              Seus créditos foram adicionados com sucesso. Em breve você receberá
              um e-mail com os detalhes da compra.
            </p>
            <div className="space-y-3 pt-2">
              <Link href="/download" className="block">
                <Button size="lg" className="w-full">
                  Baixar o app
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="secondary" size="lg" className="w-full">
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
