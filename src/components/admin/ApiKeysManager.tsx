"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createApiKey, revokeApiKey } from "@/app/admin/api-keys/actions";

type ApiKeyRow = {
  id: string;
  key_prefix: string;
  name: string;
  status: string;
  scopes: string[];
  rate_limit_per_minute: number;
  created_at: string;
  last_used_at: string | null;
};

export function ApiKeysManager({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState("users:read,stats:read,payments:read");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    startTransition(async () => {
      const result = await createApiKey(newKeyName.trim(), newKeyScopes.split(",").map((s) => s.trim()).filter(Boolean));
      if (result?.key) {
        setCreatedKey(result.key);
        setShowDialog(true);
        setNewKeyName("");
        router.refresh();
      }
    });
  };

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      await revokeApiKey(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar nova API Key</CardTitle>
          <p className="text-sm text-muted-foreground">
            A chave será exibida apenas uma vez. Guarde-a em local seguro.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Integração XYZ"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scopes">Escopos (separados por vírgula)</Label>
              <Input
                id="scopes"
                placeholder="users:read, stats:read, payments:read"
                value={newKeyScopes}
                onChange={(e) => setNewKeyScopes(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Criar API Key
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chaves existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Prefixo</TableHead>
                <TableHead>Escopos</TableHead>
                <TableHead>Rate limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma API Key criada
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-xs">{k.key_prefix}...</TableCell>
                    <TableCell className="text-xs">{k.scopes?.join(", ") || "—"}</TableCell>
                    <TableCell>{k.rate_limit_per_minute}/min</TableCell>
                    <TableCell>
                      <Badge variant={k.status === "active" ? "default" : "secondary"}>
                        {k.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {k.last_used_at
                        ? new Date(k.last_used_at).toLocaleString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {k.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleRevoke(k.id)}
                        >
                          Revogar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key criada</DialogTitle>
            <DialogDescription>
              Copie a chave agora. Ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4 font-mono text-sm break-all">
            {createdKey}
          </div>
          <Button onClick={() => setShowDialog(false)}>Fechar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
