"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      login(formData);
    });
  };

  const errorMessages: Record<string, string> = {
    missing_fields: "Por favor, preencha todos os campos.",
    invalid_credentials: "Email ou senha inválidos.",
    not_admin: "Acesso negado. Apenas administradores podem acessar.",
    not_whitelisted:
      "Seu email não está autorizado a acessar o painel administrativo.",
    not_authorized:
      "Acesso negado. Verifique se possui permissão de administrador e se seu email está na lista de autorizados.",
    not_found: "Usuário não encontrado.",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full flex items-center border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src="/logo.png"
              alt="EditAI"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">EditAI Admin</h2>
            <p className="text-xs text-muted-foreground">
              Painel de controle do sistema
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-lg shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Bem-vindo de volta
              </h1>
              <p className="text-muted-foreground mt-1">
                Acesse o painel administrativo para gerenciar usuários, planos e
                relatórios.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errorMessages[error] ?? `Erro: ${decodeURIComponent(error)}`}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do administrador</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    required
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 gap-2"
              >
                Entrar
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Acesso restrito</p>
              <p className="mt-1">
                Esta é uma área administrativa do EditAI. Todas as ações são
                registradas. Apenas emails autorizados na whitelist podem
                acessar.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EditAI. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
