"use client";

import { useState, useTransition } from "react";
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  EditDetailSheet,
  OPERATION_LABELS,
  type RecentEdit,
} from "@/components/admin/EditDetailSheet";
import {
  fetchUserEditsAdmin,
} from "@/app/admin/users/actions";
import type { UserEditsPage } from "@/lib/admin/user-edits";

type UserEditsTableProps = {
  userId: string;
  initialPage: UserEditsPage;
};

export function UserEditsTable({ userId, initialPage }: UserEditsTableProps) {
  const [editsPage, setEditsPage] = useState(initialPage);
  const [selectedEdit, setSelectedEdit] = useState<RecentEdit | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const goToPage = (nextPage: number) => {
    if (
      isPending ||
      nextPage < 1 ||
      nextPage > editsPage.totalPages ||
      nextPage === editsPage.page
    ) {
      return;
    }

    startTransition(async () => {
      const result = await fetchUserEditsAdmin(userId, nextPage);
      setEditsPage(result);
    });
  };

  if (editsPage.total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma edição registrada para este usuário.
      </p>
    );
  }

  const rangeStart = (editsPage.page - 1) * editsPage.pageSize + 1;
  const rangeEnd = Math.min(editsPage.page * editsPage.pageSize, editsPage.total);

  return (
    <>
      <div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Edições ({editsPage.total})
          </p>
          <p className="text-xs text-muted-foreground">
            Clique em uma linha para ver prompt e imagens
          </p>
        </div>

        <div className="relative rounded-lg border">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">Preview</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {editsPage.edits.map((edit) => {
                const promptPreview =
                  edit.prompt_text_original?.trim() ||
                  edit.prompt_text?.trim() ||
                  "—";
                const thumbUrl = edit.image_url || edit.original_image_url;

                return (
                  <TableRow
                    key={edit.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedEdit(edit);
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="relative size-12 overflow-hidden rounded-md border bg-muted/30">
                        {thumbUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {OPERATION_LABELS[edit.operation_type ?? ""] ??
                        edit.operation_type ??
                        "—"}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {promptPreview}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(edit.created_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={
                                edit.status === "completed"
                                  ? "default"
                                  : edit.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {edit.status ?? "—"}
                            </Badge>
                            {edit.error_message && (
                              <p className="line-clamp-2 text-xs text-destructive">
                                {edit.error_message}
                              </p>
                            )}
                          </div>
                        </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {editsPage.totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {rangeStart}–{rangeEnd} de {editsPage.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || editsPage.page <= 1}
                onClick={() => goToPage(editsPage.page - 1)}
              >
                <ChevronLeft className="size-4 mr-1" />
                Anterior
              </Button>
              <span className="min-w-[88px] text-center text-sm text-muted-foreground">
                Página {editsPage.page} de {editsPage.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || editsPage.page >= editsPage.totalPages}
                onClick={() => goToPage(editsPage.page + 1)}
              >
                Próxima
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditDetailSheet
        edit={selectedEdit}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
