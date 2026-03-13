"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client-browser";

/* ─── Ícone de usuário indicado ─── */
function ReferralBadge({ code }: { code: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3">
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        ✓
      </span>
      <div>
        <p className="text-sm font-medium text-primary">Você foi indicado!</p>
        <p className="text-xs text-secondary">
          Código de indicação{" "}
          <span className="font-mono font-semibold text-brand">{code}</span>{" "}
          aplicado automaticamente.
        </p>
      </div>
    </div>
  );
}

/* ─── Formulário (lê searchParams aqui dentro) ─── */
function CriarContaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const referralCode = searchParams.get("ref");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    // Validações básicas
    if (name.trim().length < 2) {
      setFormError("Informe seu nome completo.");
      return;
    }
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Passo 1 — Criar usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (signUpError) {
        setFormError(translateSupabaseError(signUpError.message));
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setFormError("Não foi possível criar a conta. Tente novamente.");
        return;
      }

      // Passo 2 — Completar registro (nome + indicação) via API server-side
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          referralCode: referralCode ?? null,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        // Erro não-crítico: conta criada, mas dados extras falharam
        console.error("[criar_conta] complete-registration error:", body.error);
      }

      // Passo 3 — Supabase exige confirmação de email por padrão
      // Se o usuário já existe confirmado e fez login, redireciona direto
      if (data.session) {
        router.push("/download");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("[criar_conta] erro inesperado:", err);
      setFormError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Tela de confirmação de e-mail ── */
  if (success) {
    return (
      <Card className="w-full max-w-md bg-surface p-8 shadow-lg text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success text-2xl">
          ✉
        </div>
        <h1 className="text-xl font-semibold text-primary">Confirme seu e-mail</h1>
        <p className="text-sm text-secondary">
          Enviamos um link de confirmação para{" "}
          <span className="font-medium text-primary">{email}</span>. Abra o e-mail e
          clique no link para ativar sua conta.
        </p>
        <Link href="/download" className="mt-1 block">
          <Button variant="secondary" size="lg" className="w-full">
            Baixar o app agora
          </Button>
        </Link>
        <p className="text-xs text-tertiary">
          Não recebeu o e-mail?{" "}
          <button
            type="button"
            className="font-medium text-brand hover:underline"
            onClick={() => setSuccess(false)}
          >
            Tentar novamente
          </button>
        </p>
      </Card>
    );
  }

  /* ── Formulário principal ── */
  return (
    <Card className="w-full max-w-md bg-surface p-8 shadow-lg">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-primary">
        Criar conta
      </h1>
      <p className="mt-2 text-sm text-secondary">
        Comece a usar o Editai em poucos segundos.
      </p>

      {/* Banner de indicação */}
      {referralCode && (
        <div className="mt-4">
          <ReferralBadge code={referralCode} />
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">Nome completo</label>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">E-mail</label>
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
          <label htmlFor="senha" className="text-sm font-medium">Senha</label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Erro do formulário */}
        {formError && (
          <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-5 text-xs text-tertiary">
        Ao criar uma conta, você concorda com nossos{" "}
        <Link href="/termos_de_uso" className="font-medium text-primary hover:underline">
          Termos de Uso
        </Link>{" "}
        e{" "}
        <Link href="/politicas_de_privacidade" className="font-medium text-primary hover:underline">
          Políticas de Privacidade
        </Link>
        .
      </p>

      <p className="mt-3 text-center text-xs text-tertiary">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}

/* ─── Traduz erros do Supabase para pt-BR ─── */
function translateSupabaseError(message: string): string {
  if (message.includes("User already registered")) {
    return "Este e-mail já está cadastrado. Tente entrar na sua conta.";
  }
  if (message.includes("invalid email")) {
    return "Endereço de e-mail inválido.";
  }
  if (message.includes("Password should be")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (message.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return "Não foi possível criar a conta. Tente novamente.";
}

/* ─── Page export — Suspense obrigatório para useSearchParams no App Router ─── */
export default function CriarContaPage() {
  return (
    <main className="bg-app">
      <section className="flex min-h-[calc(100vh-4rem)] items-center py-12 md:py-20">
        <Container className="flex justify-center">
          <Suspense
            fallback={
              <Card className="w-full max-w-md bg-surface p-8 shadow-lg">
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
            }
          >
            <CriarContaForm />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
