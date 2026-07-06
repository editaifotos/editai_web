"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import {
  fetchUsersAdminList,
} from "@/app/admin/users/actions";
import type { AdminUserRow } from "@/lib/admin/users";

export function UsersTable({
  users: initialUsers,
  planFilterId,
  planFilterName,
}: {
  users: AdminUserRow[];
  planFilterId?: string;
  planFilterName?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    const term = search.trim();

    if (term.length < 2) {
      setUsers(initialUsers);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await fetchUsersAdminList(term, planFilterId);
      setUsers(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, initialUsers, planFilterId]);

  const statusVariant = (s: string) => {
    if (s === "active") return "default";
    if (s === "canceled" || s === "expired") return "destructive";
    return "secondary";
  };

  const isRemoteSearch = search.trim().length >= 2;
  const emptyMessage = isRemoteSearch
    ? "Nenhum usuário encontrado para esta busca"
    : "Nenhum usuário encontrado";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isRemoteSearch
            ? `Buscando em todos os usuários (${users.length} resultado${users.length === 1 ? "" : "s"})`
            : planFilterId
              ? `Mostrando usuários do plano ${planFilterName ?? "selecionado"} (${users.length})`
              : "Mostrando os 50 usuários mais recentes — digite 2+ caracteres para buscar todos"}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "—"}
                  </TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>{user.plans?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.subscription_status)}>
                      {user.subscription_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.credits_balance}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
