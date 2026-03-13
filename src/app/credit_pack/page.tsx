"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  maskCpf,
  maskPhone,
  maskCardNumber,
  maskCardExpiry,
  maskCep,
} from "@/utils/masks";

interface PackData {
  id: string;
  name: string;
  credits: number;
  price: number;
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

type PaymentMethod = "CREDIT_CARD" | "PIX";

function CreditPackForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packId = searchParams.get("id");

  const [pack, setPack] = useState<PackData | null>(null);
  const [packLoading, setPackLoading] = useState(true);
  const [packError, setPackError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [pixStep, setPixStep] = useState<"form" | "qr">("form");
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [pixQrData, setPixQrData] = useState<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

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
  const [foreignCustomer, setForeignCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!packId) {
      setPackError("Pacote não informado.");
      setPackLoading(false);
      return;
    }

    fetch(`/api/credit_pack?id=${encodeURIComponent(packId)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Pacote não encontrado.");
          throw new Error("Erro ao carregar pacote.");
        }
        return res.json();
      })
      .then((data: PackData) => setPack(data))
      .catch((err) => setPackError(err.message))
      .finally(() => setPackLoading(false));
  }, [packId]);

  useEffect(() => {
    if (pixStep !== "qr" || !pixPaymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/credit_pack/payment-status?paymentId=${encodeURIComponent(pixPaymentId)}`
        );
        const data = (await res.json()) as { status?: string };
        if (data.status === "RECEIVED") {
          clearInterval(interval);
          router.push("/finalizeCreditPack");
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pixStep, pixPaymentId, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!packId || !pack) return;

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        paymentMethod,
        packId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ""),
        cpf: cpf.replace(/\D/g, ""),
        foreignCustomer,
      };

      if (paymentMethod === "CREDIT_CARD") {
        body.creditCard = {
          holderName: cardHolderName.trim(),
          number: cardNumber.replace(/\D/g, ""),
          expiry: cardExpiry.replace(/\D/g, ""),
          ccv: cardCvv.replace(/\D/g, ""),
        };
        body.address = {
          postalCode: postalCode.replace(/\D/g, ""),
          number: addressNumber.trim(),
          complement: addressComplement.trim() || null,
        };
      }

      const res = await fetch("/api/credit_pack/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        paymentId?: string;
      };

      if (!res.ok) {
        setFormError(data.error ?? "Erro ao processar. Tente novamente.");
        return;
      }

      if (data.success && paymentMethod === "PIX" && data.paymentId) {
        const qrRes = await fetch(
          `/api/credit_pack/pix-qr?paymentId=${encodeURIComponent(data.paymentId)}`
        );
        const qrData = (await qrRes.json()) as {
          encodedImage?: string;
          payload?: string;
          expirationDate?: string;
        };
        if (qrRes.ok && qrData.encodedImage && qrData.payload) {
          setPixPaymentId(data.paymentId);
          setPixQrData({
            encodedImage: qrData.encodedImage,
            payload: qrData.payload,
            expirationDate: qrData.expirationDate ?? "",
          });
          setPixStep("qr");
        } else {
          setFormError("Erro ao gerar QR Code PIX. Tente novamente.");
        }
      } else if (data.success && paymentMethod === "CREDIT_CARD") {
        router.push("/finalizeCreditPack");
      } else {
        setFormError("Erro inesperado. Tente novamente.");
      }
    } catch {
      setFormError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPixPayload() {
    if (!pixQrData?.payload) return;
    try {
      await navigator.clipboard.writeText(pixQrData.payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      // clipboard may fail in some contexts
    }
  }

  if (packLoading) {
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

  if (packError || !pack) {
    return (
      <Card className="w-full max-w-lg bg-surface p-8 shadow-lg text-center">
        <p className="text-error">{packError ?? "Pacote não encontrado."}</p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">Voltar ao início</Button>
        </Link>
      </Card>
    );
  }

  const priceFormatted = pack.price.toFixed(2).replace(".", ",");

  if (pixStep === "qr" && pixQrData) {
    return (
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="order-2 lg:order-1 min-w-0">
          <Card className="bg-surface p-6 shadow-lg md:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
              Pague com PIX
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Escaneie o QR Code com o app do seu banco ou copie o código PIX para
              colar no app.
            </p>

            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="rounded-xl border border-default bg-white p-4">
                <img
                  src={`data:image/png;base64,${pixQrData.encodedImage}`}
                  alt="QR Code PIX"
                  className="size-48"
                />
              </div>
              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-secondary">
                  Ou copie o código PIX:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixQrData.payload}
                    className="flex-1 rounded-xl border border-default bg-surface-2 px-4 py-2.5 text-sm text-primary"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={copyPixPayload}
                  >
                    {copiedPayload ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-tertiary">
                Aguardando confirmação do pagamento. Esta página será atualizada
                automaticamente quando o pagamento for recebido.
              </p>
            </div>
          </Card>
        </div>
        <div className="order-1 lg:order-2 min-w-0">
          <Card className="bg-surface p-6 shadow-lg lg:sticky lg:top-24 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Checkout
            </p>
            <h2 className="mt-2 text-xl font-bold text-primary md:text-2xl">
              Resumo da compra
            </h2>
            <div className="mt-6 flex gap-4 rounded-xl border border-default bg-surface-2/50 p-4">
              <img
                src="/assets/appstore.png"
                alt="Editai"
                className="size-16 flex-shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-primary">{pack.name}</p>
                <p className="mt-1 text-sm text-secondary">
                  {pack.credits} créditos
                </p>
                <p className="mt-1 text-lg font-semibold text-brand">
                  R$ {priceFormatted}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="order-2 lg:order-1 min-w-0">
        <Card className="bg-surface p-6 shadow-lg md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
            Comprar créditos extra
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {paymentMethod === "PIX"
              ? "Preencha seus dados para gerar o QR Code PIX."
              : "Preencha seus dados e do cartão para concluir a compra."}
          </p>
          <p className="mt-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm text-secondary">
            Já tem conta no app? Use o mesmo e-mail que você usa para acessar o Editai.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <p className="text-sm font-medium text-secondary">
                Forma de pagamento
              </p>
              <div className="flex gap-4 rounded-xl border border-default p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    paymentMethod === "CREDIT_CARD"
                      ? "bg-brand text-white"
                      : "text-secondary hover:bg-surface-2"
                  }`}
                >
                  Cartão
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PIX")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    paymentMethod === "PIX"
                      ? "bg-brand text-white"
                      : "text-secondary hover:bg-surface-2"
                  }`}
                >
                  PIX
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-secondary">
                Dados pessoais
              </p>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  autoComplete="off"
                  required={!foreignCustomer}
                  disabled={foreignCustomer}
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="foreignCustomer"
                  name="foreignCustomer"
                  type="checkbox"
                  checked={foreignCustomer}
                  onChange={(e) => setForeignCustomer(e.target.checked)}
                  className="size-4 rounded border-default"
                />
                <Label htmlFor="foreignCustomer" className="cursor-pointer text-sm font-normal">
                  Cliente estrangeiro?
                </Label>
              </div>
            </div>

            {paymentMethod === "CREDIT_CARD" && (
              <>
            <div className="space-y-4 border-t border-default pt-5">
              <p className="text-sm font-medium text-secondary">
                Dados do cartão
              </p>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Validade (MM/AA)</Label>
                  <Input
                    id="cardExpiry"
                    name="cardExpiry"
                    type="text"
                    placeholder="MM/AA"
                    autoComplete="cc-exp"
                    required
                    value={cardExpiry}
                    onChange={(e) =>
                      setCardExpiry(maskCardExpiry(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input
                    id="cardCvv"
                    name="cardCvv"
                    type="text"
                    placeholder="123"
                    autoComplete="cc-csc"
                    required
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Nome no cartão</Label>
                <Input
                  id="cardHolderName"
                  name="cardHolderName"
                  type="text"
                  placeholder="Como está impresso no cartão"
                  autoComplete="cc-name"
                  required
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-default pt-5">
              <p className="text-sm font-medium text-secondary">
                Endereço (titular do cartão)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="postalCode">CEP</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    placeholder="00000-000"
                    autoComplete="postal-code"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(maskCep(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressNumber">Número</Label>
                  <Input
                    id="addressNumber"
                    name="addressNumber"
                    type="text"
                    placeholder="123"
                    autoComplete="street-address"
                    required
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressComplement">Complemento (opcional)</Label>
                <Input
                  id="addressComplement"
                  name="addressComplement"
                  type="text"
                  placeholder="Apto, bloco..."
                  autoComplete="off"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                />
              </div>
            </div>
              </>
            )}

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
                {loading
                  ? "Processando..."
                  : paymentMethod === "PIX"
                    ? "Gerar QR Code PIX"
                    : "Comprar agora"}
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

      <div className="order-1 lg:order-2 min-w-0">
        <Card className="bg-surface p-6 shadow-lg lg:sticky lg:top-24 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Checkout
          </p>
          <h2 className="mt-2 text-xl font-bold text-primary md:text-2xl">
            Resumo da compra
          </h2>

          <div className="mt-6 flex gap-4 rounded-xl border border-default bg-surface-2/50 p-4">
            <img
              src="/assets/appstore.png"
              alt="Editai"
              className="size-16 flex-shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-primary">{pack.name}</p>
              <p className="mt-1 text-sm text-secondary">
                {pack.credits} créditos
              </p>
              <p className="mt-1 text-lg font-semibold text-brand">
                R$ {priceFormatted} — cobrança única
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-default pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">
                Total a pagar
              </span>
              <span className="text-lg font-bold text-brand">
                R$ {priceFormatted}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CreditPackPage() {
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
            <CreditPackForm />
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
