"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  maskCpf,
  maskPhone,
  maskCardNumber,
  maskCardExpiry,
  maskCep,
} from "@/utils/masks";

interface PlanData {
  name: string;
  value: number;
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4 text-secondary"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId") ?? searchParams.get("plan_id");

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setPlanError("Plano não informado.");
      setPlanLoading(false);
      return;
    }

    fetch(`/api/checkout/plan?planId=${encodeURIComponent(planId)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Plano não encontrado.");
          throw new Error("Erro ao carregar plano.");
        }
        return res.json();
      })
      .then((data: PlanData) => setPlan(data))
      .catch((err) => setPlanError(err.message))
      .finally(() => setPlanLoading(false));
  }, [planId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!planId || !plan) return;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          creditCard: {
            holderName: cardHolderName.trim(),
            number: cardNumber.replace(/\D/g, ""),
            expiry: cardExpiry.replace(/\D/g, ""),
            ccv: cardCvv.replace(/\D/g, ""),
          },
          address: {
            postalCode: postalCode.replace(/\D/g, ""),
            number: addressNumber.trim(),
            complement: addressComplement.trim() || null,
          },
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Erro ao processar. Tente novamente.");
        return;
      }

      if (data.success) {
        router.push("/finalizeCheckout");
      } else {
        setFormError("Erro inesperado. Tente novamente.");
      }
    } catch {
      setFormError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (planLoading) {
    return (
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        <Card className="bg-surface p-6 shadow-lg md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-surface-2" />
            <div className="h-4 w-64 rounded-lg bg-surface-2" />
            <div className="mt-6 space-y-3">
              <div className="h-10 rounded-xl bg-surface-2" />
              <div className="h-10 rounded-xl bg-surface-2" />
              <div className="h-10 rounded-xl bg-surface-2" />
              <div className="h-10 rounded-xl bg-surface-2" />
              <div className="h-10 rounded-xl bg-surface-2" />
              <div className="h-12 rounded-full bg-surface-2" />
            </div>
          </div>
        </Card>
        <Card className="hidden bg-surface p-6 shadow-lg lg:block lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-surface-2" />
            <div className="h-8 w-40 rounded-lg bg-surface-2" />
            <div className="h-20 rounded-2xl bg-surface-2" />
            <div className="h-6 w-32 rounded bg-surface-2" />
          </div>
        </Card>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <Card className="w-full max-w-lg bg-surface p-8 shadow-lg text-center">
        <p className="text-error">{planError ?? "Plano não encontrado."}</p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">Voltar ao início</Button>
        </Link>
      </Card>
    );
  }

  const priceFormatted = plan.value.toFixed(2).replace(".", ",");

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Mobile: resumo (informações) em cima, formulário (dados de pagamento) embaixo */}
      {/* Desktop: formulário à esquerda, resumo à direita */}
      <div className="order-2 lg:order-1 min-w-0">
        <Card className="bg-surface p-6 shadow-lg md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
            Finalizar assinatura
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Preencha seus dados e do cartão para concluir a assinatura.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <p className="text-sm font-medium text-secondary">
                Dados pessoais
              </p>
              <Input
                name="name"
                label="Nome completo"
                placeholder="Seu nome"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                name="email"
                type="email"
                label="E-mail"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                name="phone"
                type="tel"
                label="Telefone"
                placeholder="(00) 00000-0000"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
              />
              <Input
                name="cpf"
                type="text"
                label="CPF"
                placeholder="000.000.000-00"
                autoComplete="off"
                required
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
              />
            </div>

            <div className="space-y-4 border-t border-default pt-5">
              <p className="text-sm font-medium text-secondary">
                Dados do cartão
              </p>
              <Input
                name="cardNumber"
                type="text"
                label="Número do cartão"
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="cardExpiry"
                  type="text"
                  label="Validade (MM/AA)"
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                  required
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(maskCardExpiry(e.target.value))}
                />
                <Input
                  name="cardCvv"
                  type="text"
                  label="CVV"
                  placeholder="123"
                  autoComplete="cc-csc"
                  required
                  value={cardCvv}
                  onChange={(e) =>
                    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
              </div>
              <Input
                name="cardHolderName"
                type="text"
                label="Nome no cartão"
                placeholder="Como está impresso no cartão"
                autoComplete="cc-name"
                required
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>

            <div className="space-y-4 border-t border-default pt-5">
              <p className="text-sm font-medium text-secondary">
                Endereço (titular do cartão)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    name="postalCode"
                    type="text"
                    label="CEP"
                    placeholder="00000-000"
                    autoComplete="postal-code"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(maskCep(e.target.value))}
                  />
                </div>
                <Input
                  name="addressNumber"
                  type="text"
                  label="Número"
                  placeholder="123"
                  autoComplete="street-address"
                  required
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                />
              </div>
              <Input
                name="addressComplement"
                type="text"
                label="Complemento (opcional)"
                placeholder="Apto, bloco..."
                autoComplete="off"
                value={addressComplement}
                onChange={(e) => setAddressComplement(e.target.value)}
              />
            </div>

            {formError && (
              <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">
                {formError}
              </p>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-secondary">
                <LockIcon />
                <span>Pagamento protegido</span>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Processando pagamento..." : "Assinar agora"}
              </Button>
            </div>
          </form>

          <p className="mt-5 text-xs text-tertiary">
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="/termos_de_uso"
              className="font-medium text-primary hover:underline"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              href="/politicas_de_privacidade"
              className="font-medium text-primary hover:underline"
            >
              Políticas de Privacidade
            </Link>
            .
          </p>
        </Card>
      </div>

      {/* Coluna direita: Resumo da assinatura — no mobile vem primeiro */}
      <div className="order-1 lg:order-2 min-w-0">
        <Card className="bg-surface p-6 shadow-lg lg:sticky lg:top-24 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Checkout
          </p>
          <h2 className="mt-2 text-xl font-bold text-primary md:text-2xl">
            Resumo da assinatura
          </h2>

          <div className="mt-6 flex gap-4 rounded-xl border border-default bg-surface-2/50 p-4">
            <img
              src="/assets/appstore.png"
              alt="Editai"
              className="size-16 flex-shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-primary">{plan.name}</p>
              <p className="mt-1 text-lg font-semibold text-brand">
                R$ {priceFormatted}/mês
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-default pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">
                Total a pagar
              </span>
              <span className="text-lg font-bold text-brand">
                R$ {priceFormatted}/mês
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-app">
      <section className="flex-1 py-6 md:py-8 lg:py-12">
        <Container className="flex flex-col items-center">
          <Suspense
            fallback={
              <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
                <Card className="bg-surface p-6 shadow-lg md:p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 rounded-lg bg-surface-2" />
                    <div className="h-4 w-64 rounded-lg bg-surface-2" />
                    <div className="mt-6 space-y-3">
                      <div className="h-10 rounded-xl bg-surface-2" />
                      <div className="h-10 rounded-xl bg-surface-2" />
                      <div className="h-10 rounded-xl bg-surface-2" />
                      <div className="h-12 rounded-full bg-surface-2" />
                    </div>
                  </div>
                </Card>
                <Card className="hidden bg-surface p-6 shadow-lg lg:block lg:p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 w-24 rounded bg-surface-2" />
                    <div className="h-8 w-40 rounded-lg bg-surface-2" />
                    <div className="h-20 rounded-2xl bg-surface-2" />
                  </div>
                </Card>
              </div>
            }
          >
            <CheckoutForm />
          </Suspense>
        </Container>
      </section>
      <footer className="border-t border-default bg-surface py-4">
        <Container>
          <div className="flex items-center justify-center gap-2 text-sm text-secondary">
            <LockIcon />
            <span>Pagamento seguro</span>
          </div>
        </Container>
      </footer>
    </main>
  );
}