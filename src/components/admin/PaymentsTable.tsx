"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronRight, ChevronsUpDown, Users } from "lucide-react";
import { searchUsersAdmin, type UserSearchResult } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  payment_status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  users: { email: string | null; name: string | null } | null;
};

type UserOption = { id: string; label: string };

export function PaymentsTable({
  payments,
  users,
  initialUserId,
}: {
  payments: PaymentRow[];
  users: UserOption[];
  initialUserId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("userId") ?? undefined;

  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const selectedUserId = initialUserId ?? userIdFromUrl ?? "";
  const selectedLabel = useCallback(() => {
    if (!selectedUserId) return "Todos os usuários";
    const fromSearch = searchResults.find((u) => u.id === selectedUserId);
    if (fromSearch) return fromSearch.label;
    const fromUsers = users.find((u) => u.id === selectedUserId);
    return fromUsers?.label ?? selectedUserId;
  }, [selectedUserId, searchResults, users]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchUsersAdmin(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const displayResults = searchQuery.length >= 2 ? searchResults : [];
  const hasSearch = searchQuery.length >= 2;

  const handleSelect = (id: string) => {
    if (id === "__all__" || !id) {
      router.push("/admin/payments");
    } else {
      router.push(`/admin/payments?userId=${id}`);
    }
    setOpen(false);
    setSearchQuery("");
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const statusVariant = (s: string) => {
    if (s === "paid") return "default";
    if (s === "failed" || s === "refunded") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por usuário</span>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            role="combobox"
            aria-expanded={open}
            className="inline-flex h-9 w-[280px] items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal shadow-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="truncate">
              {selectedUserId ? selectedLabel() : "Todos os usuários"}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Digite nome ou email para buscar..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {isSearching
                    ? "Buscando..."
                    : hasSearch
                      ? "Nenhum usuário encontrado"
                      : "Digite ao menos 2 caracteres"}
                </CommandEmpty>
                <CommandGroup>
                  <CommandItem value="__all__" onSelect={(v) => handleSelect(v)}>
                    <span className={cn(!selectedUserId && "font-medium")}>
                      Todos os usuários
                    </span>
                  </CommandItem>
                  {displayResults.map((u) => (
                    <CommandItem key={u.id} value={u.id} onSelect={(v) => handleSelect(v)}>
                      <span className={cn(selectedUserId === u.id && "font-medium")}>
                        {u.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Data pagamento</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${p.user_id}`}
                      className="font-medium hover:underline"
                    >
                      {p.users?.name || p.users?.email || "—"}
                    </Link>
                  </TableCell>
                  <TableCell>{formatCurrency(Number(p.amount))}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.payment_status)}>
                      {p.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.payment_method || "—"}</TableCell>
                  <TableCell>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${p.user_id}`}>
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
