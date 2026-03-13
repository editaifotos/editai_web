"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const OPERATION_LABELS: Record<string, string> = {
  text_to_image: "Texto para Imagem",
  edit_image: "Editar Imagem",
  edit_model: "Editar com Modelo",
  remove_background: "Remover Fundo",
  multi_image: "Múltiplas Imagens",
};

const CATEGORY_LABELS: Record<string, string> = {
  food: "Comida",
  person: "Pessoa",
  landscape: "Paisagem",
  product: "Produto",
  other: "Outro",
};

const GOAL_LABELS: Record<string, string> = {
  improve_colors: "Melhorar cores",
  change_background: "Mudar fundo",
  remove_objects: "Remover objetos",
  enhance_details: "Detalhar",
  adjust_lighting: "Ajustar iluminação",
};

export type RecentEdit = {
  id: string;
  operation_type: string | null;
  status: string | null;
  created_at: string;
  prompt_text_original: string | null;
  prompt_text: string | null;
  image_url: string | null;
  edit_category: string | null;
  edit_goal: string | null;
  credits_used: number | null;
};

export function EditDetailSheet({
  edit,
  open,
  onOpenChange,
}: {
  edit: RecentEdit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!edit) return null;

  const opLabel =
    OPERATION_LABELS[edit.operation_type ?? ""] ?? edit.operation_type ?? "—";
  const catLabel =
    CATEGORY_LABELS[edit.edit_category ?? ""] ?? edit.edit_category ?? "—";
  const goalLabel =
    GOAL_LABELS[edit.edit_goal ?? ""] ?? edit.edit_goal ?? "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes da edição</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{opLabel}</Badge>
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
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Categoria</span>
            <span>{catLabel}</span>
            <span className="text-muted-foreground">Objetivo</span>
            <span>{goalLabel}</span>
            <span className="text-muted-foreground">Créditos</span>
            <span>{edit.credits_used ?? 0}</span>
            <span className="text-muted-foreground">Data</span>
            <span>
              {new Date(edit.created_at).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>

          {edit.prompt_text_original && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Prompt original
              </p>
              <p className="text-sm rounded-md bg-muted p-3">
                {edit.prompt_text_original}
              </p>
            </div>
          )}

          {edit.prompt_text &&
            edit.prompt_text !== edit.prompt_text_original && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Prompt usado
                </p>
                <p className="text-sm rounded-md bg-muted p-3">
                  {edit.prompt_text}
                </p>
              </div>
            )}

          {edit.image_url && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Imagem
              </p>
              <div className="relative aspect-square max-w-[200px] rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={edit.image_url}
                  alt="Resultado"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
