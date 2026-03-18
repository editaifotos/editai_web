"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client-browser";

type PageState = "loading" | "invalid" | "ready";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const [state, setState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      const supabase = getSupabaseBrowserClient();

      // 1. initialize() processa a URL (PKCE ou implícito)
      await supabase.auth.initialize();

      // 2. Se há tokens no hash (fluxo implícito - reset iniciado no app)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!cancelled && error) {
            setState("invalid");
            return;
          }
          // Limpar o hash da URL após processar
          if (!cancelled) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }
      }

      // 3. Se há code na query (PKCE) e ainda não tem sessão
      if (code) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!cancelled) {
            if (error) {
              setState("invalid");
              return;
            }
          }
        }
      }

      // 4. Verificar sessão final
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setState(data.session ? "ready" : "invalid");
      }
    }

    initSession();
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFormError(translateSupabaseError(error.message));
        return;
      }

      await supabase.auth.signOut();
      router.push("/download");
    } catch (err) {
      console.error("[reset-password] erro inesperado:", err);
      setFormError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function translateSupabaseError(message: string): string {
    if (message.includes("Password should be")) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    if (message.includes("rate limit")) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    return "Não foi possível redefinir a senha. Tente novamente.";
  }

  /* ── Loading ── */
  if (state === "loading") {
    return (
      <Card className="w-full max-w-md bg-surface p-8 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-surface-2" />
          <div className="h-4 w-64 rounded-lg bg-surface-2" />
          <div className="mt-6 space-y-3">
            <div className="h-10 rounded-xl bg-surface-2" />
            <div className="h-10 rounded-xl bg-surface-2" />
            <div className="h-12 rounded-full bg-surface-2" />
          </div>
        </div>
      </Card>
    );
  }

  /* ── Link inválido ou expirado ── */
  if (state === "invalid") {
    return (
      <Card className="w-full max-w-md bg-surface p-8 shadow-lg text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error text-2xl">
          ⚠
        </div>
        <h1 className="text-xl font-semibold text-primary">
          Link inválido ou expirado
        </h1>
        <p className="text-sm text-secondary">
          O link de recuperação de senha não é válido ou já foi utilizado.
          Solicite um novo link na tela de login.
        </p>
        <Link href="/download" className="mt-1 block">
          <Button variant="secondary" size="lg" className="w-full">
            Ir para o site
          </Button>
        </Link>
      </Card>
    );
  }

  /* ── Formulário de nova senha ── */
  return (
    <Card className="w-full max-w-md bg-surface p-8 shadow-lg">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-primary">
        Redefinir senha
      </h1>
      <p className="mt-2 text-sm text-secondary">
        Digite sua nova senha abaixo.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="senha" className="text-sm font-medium">
            Nova senha
          </label>
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
        <div className="space-y-2">
          <label htmlFor="confirmar" className="text-sm font-medium">
            Confirmar nova senha
          </label>
          <Input
            id="confirmar"
            name="confirmar"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

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
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-tertiary">
        <Link href="/download" className="font-medium text-primary hover:underline">
          Voltar ao site
        </Link>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
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
                    <div className="h-12 rounded-full bg-surface-2" />
                  </div>
                </div>
              </Card>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
