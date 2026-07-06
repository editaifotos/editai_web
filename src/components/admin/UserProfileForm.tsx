"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  updateUser,
  updateUserPlan,
  updateUserStatusFromForm,
  resetUserPassword,
} from "@/app/admin/users/actions";
import { ADMIN_DEFAULT_RESET_PASSWORD } from "@/config/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  OPERATION_LABELS,
  CATEGORY_LABELS,
  GOAL_LABELS,
} from "@/components/admin/EditDetailSheet";
import { UserEditsTable } from "@/components/admin/UserEditsTable";
import type { UserEditsPage } from "@/lib/admin/user-edits";

export type EditStats = {
  total: number;
  completed: number;
  failed: number;
  credits_used: number;
  last_activity: string | null;
  by_operation: Record<string, number>;
  by_category: Record<string, number>;
  by_goal?: Record<string, number>;
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  subscription_status: string;
  credits_balance: number;
  created_at: string;
  current_plan_id: string | null;
  trial_ends_at: string | null;
};

type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  started_at: string;
  ends_at: string | null;
  canceled_at: string | null;
} | null;

type Plan = { id: string; name: string } | null;

export function UserProfileForm({
  user,
  subscription,
  plan,
  plans,
  editStats,
  initialEditsPage,
}: {
  user: User;
  subscription: Subscription;
  plan: Plan;
  plans: { id: string; name: string }[];
  editStats: EditStats | null;
  initialEditsPage: UserEditsPage;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleResetPassword = () => {
    startTransition(async () => {
      const result = await resetUserPassword(user.id);
      setResetDialogOpen(false);

      if (result.success) {
        setResetMessage({
          type: "success",
          text: `Senha redefinida com sucesso. Informe ao cliente a nova senha: ${result.password}`,
        });
      } else {
        setResetMessage({
          type: "error",
          text: result.error || "Não foi possível redefinir a senha.",
        });
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do usuário</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cadastrado em {new Date(user.created_at).toLocaleDateString("pt-BR")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                className="h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Status da assinatura</Label>
              <div>
                <Badge variant={user.subscription_status === "active" ? "default" : "secondary"}>
                  {user.subscription_status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Créditos</Label>
              <p className="font-medium">{user.credits_balance}</p>
            </div>
            {plan && (
              <div className="space-y-2">
                <Label>Plano atual</Label>
                <p className="font-medium">{plan.name}</p>
              </div>
            )}
            {subscription && (
              <>
                <div className="space-y-2">
                  <Label>Início</Label>
                  <p className="text-sm">
                    {new Date(subscription.started_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {subscription.ends_at && (
                  <div className="space-y-2">
                    <Label>Expira em</Label>
                    <p className="text-sm">
                      {new Date(subscription.ends_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <form
            action={(fd) => {
              startTransition(async () => {
                await updateUser(user.id, fd);
                router.refresh();
              });
            }}
            className="flex gap-2"
          >
            <Button type="submit" disabled={isPending}>
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {editStats && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade e estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Resumo
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Total: {editStats.total}
                  </Badge>
                  <Badge variant="default">
                    Concluídas: {editStats.completed}
                  </Badge>
                  <Badge variant="destructive">
                    Falhas: {editStats.failed}
                  </Badge>
                  <Badge variant="outline">
                    Créditos consumidos: {editStats.credits_used}
                  </Badge>
                  {editStats.last_activity && (
                    <Badge variant="outline">
                      Última atividade:{" "}
                      {new Date(editStats.last_activity).toLocaleString(
                        "pt-BR",
                        { dateStyle: "short", timeStyle: "short" }
                      )}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Por tipo de operação
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(editStats.by_operation ?? {}).map(
                    ([op, cnt]) => (
                      <Badge key={op} variant="secondary">
                        {OPERATION_LABELS[op] ?? op}: {cnt}
                      </Badge>
                    )
                  )}
                  {(!editStats.by_operation ||
                    Object.keys(editStats.by_operation).length === 0) && (
                    <span className="text-sm text-muted-foreground">
                      Nenhuma
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Por categoria
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(editStats.by_category ?? {}).map(
                    ([cat, cnt]) => (
                      <Badge key={cat} variant="secondary">
                        {CATEGORY_LABELS[cat] ?? cat}: {cnt}
                      </Badge>
                    )
                  )}
                  {(!editStats.by_category ||
                    Object.keys(editStats.by_category).length === 0) && (
                    <span className="text-sm text-muted-foreground">
                      Nenhuma
                    </span>
                  )}
                </div>
              </div>
              {editStats.by_goal &&
                Object.keys(editStats.by_goal).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Por objetivo
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(editStats.by_goal).map(([goal, cnt]) => (
                        <Badge key={goal} variant="secondary">
                          {GOAL_LABELS[goal] ?? goal}: {cnt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <UserEditsTable userId={user.id} initialPage={initialEditsPage} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alterar plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(fd) => {
              startTransition(() => {
                const planId = fd.get("plan_id") as string;
                if (planId) updateUserPlan(user.id, planId).then(() => router.refresh());
              });
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="plan_id">Novo plano</Label>
              <select
                id="plan_id"
                name="plan_id"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um plano</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={isPending}>
              Alterar plano
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar status</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) => {
              startTransition(() => {
                updateUserStatusFromForm(user.id, formData).then(() => router.refresh());
              });
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={user.subscription_status}
                key={user.subscription_status}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Ativo</option>
                <option value="canceled">Cancelado</option>
                <option value="expired">Expirado</option>
                <option value="trial">Trial</option>
                <option value="trialing">Trialing</option>
              </select>
            </div>
            <Button type="submit" disabled={isPending}>
              Atualizar status
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define uma senha temporária padrão para o usuário acessar a conta
            novamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Instruções para o admin</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Ao confirmar, a senha será alterada para{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  {ADMIN_DEFAULT_RESET_PASSWORD}
                </code>
                .
              </li>
              <li>
                Comunique essa senha ao cliente por um canal seguro (WhatsApp,
                email ou telefone).
              </li>
              <li>
                Oriente o cliente a trocar a senha após o primeiro acesso, se
                possível.
              </li>
            </ol>
          </div>

          {resetMessage && (
            <p
              className={
                resetMessage.type === "success"
                  ? "rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-2.5 text-sm text-green-700 dark:text-green-400"
                  : "rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-sm text-error"
              }
            >
              {resetMessage.text}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setResetDialogOpen(true)}
          >
            Redefinir senha para padrão
          </Button>

          <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Redefinir senha do usuário?</AlertDialogTitle>
                <AlertDialogDescription>
                  A senha de{" "}
                  <strong>{user.email || user.name || "este usuário"}</strong>{" "}
                  será alterada para{" "}
                  <strong>{ADMIN_DEFAULT_RESET_PASSWORD}</strong>. Depois,
                  informe essa senha ao cliente para que ele consiga entrar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={handleResetPassword}
                >
                  {isPending ? "Redefinindo..." : "Confirmar redefinição"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
