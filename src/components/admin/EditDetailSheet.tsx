"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ImageIcon, AlertCircle } from "lucide-react";

export const OPERATION_LABELS: Record<string, string> = {
  text_to_image: "Texto para Imagem",
  edit_image: "Editar Imagem",
  edit_model: "Editar com Modelo",
  remove_background: "Remover Fundo",
  multi_image: "Múltiplas Imagens",
};

export const CATEGORY_LABELS: Record<string, string> = {
  food: "Comida",
  person: "Pessoa",
  landscape: "Paisagem",
  product: "Produto",
  other: "Outro",
};

export const GOAL_LABELS: Record<string, string> = {
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
  original_image_url: string | null;
  edit_category: string | null;
  edit_goal: string | null;
  credits_used: number | null;
  width: number | null;
  height: number | null;
  ai_processing_time_ms: number | null;
  task_id: string | null;
  error_message: string | null;
  provider_status: string | null;
};

function getDisplayPrompt(edit: RecentEdit): string | null {
  return edit.prompt_text_original?.trim() || edit.prompt_text?.trim() || null;
}

function getProcessedPrompt(edit: RecentEdit): string | null {
  const original = edit.prompt_text_original?.trim();
  const processed = edit.prompt_text?.trim();
  if (!processed) return null;
  if (original && processed === original) return null;
  return processed;
}

function ImagePreview({
  label,
  url,
  emptyLabel,
}: {
  label: string;
  url: string | null;
  emptyLabel: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {url && !failed && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center rounded-lg px-2 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-3.5 mr-1.5" />
            Abrir
          </a>
        )}
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted/30">
        {url && !failed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt={label}
            className="h-full w-full object-contain bg-black/5"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="size-8 opacity-40" />
            <p className="text-sm">{url && failed ? "Não foi possível carregar" : emptyLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const displayPrompt = getDisplayPrompt(edit);
  const processedPrompt = getProcessedPrompt(edit);
  const hasOriginal = Boolean(edit.original_image_url);
  const hasResult = Boolean(edit.image_url);
  const hasError = Boolean(edit.error_message?.trim());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle>Detalhes da edição</SheetTitle>
          <SheetDescription>
            Prompt utilizado e comparação entre imagem original e resultado
          </SheetDescription>
          <div className="flex flex-wrap gap-2 pt-2">
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
            <Badge variant="outline">{catLabel}</Badge>
            <Badge variant="outline">{goalLabel}</Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border bg-muted/20 p-4 text-sm">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium">
              {new Date(edit.created_at).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
            <span className="text-muted-foreground">Créditos</span>
            <span className="font-medium">{edit.credits_used ?? 0}</span>
            {edit.width && edit.height && (
              <>
                <span className="text-muted-foreground">Dimensões</span>
                <span className="font-medium">
                  {edit.width} × {edit.height}px
                </span>
              </>
            )}
            {edit.ai_processing_time_ms != null && (
              <>
                <span className="text-muted-foreground">Processamento</span>
                <span className="font-medium">
                  {(edit.ai_processing_time_ms / 1000).toFixed(1)}s
                </span>
              </>
            )}
          </div>

          {hasError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <p className="text-sm font-semibold">Erro no processamento</p>
              </div>
              <p className="text-sm leading-relaxed">{edit.error_message}</p>
              {edit.provider_status && (
                <p className="text-xs text-muted-foreground">
                  Status do provedor: {edit.provider_status}
                </p>
              )}
            </div>
          )}

          {displayPrompt && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Prompt do usuário</p>
              <div className="rounded-xl border bg-background p-4 text-sm leading-relaxed">
                {displayPrompt}
              </div>
            </div>
          )}

          {processedPrompt && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Prompt processado pela IA</p>
              <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
                {processedPrompt}
              </div>
            </div>
          )}

          {!displayPrompt && !processedPrompt && (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Nenhum prompt registrado para esta edição.
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-semibold">Imagens</p>
            <div
              className={
                hasOriginal && hasResult
                  ? "grid gap-4 sm:grid-cols-2"
                  : "grid gap-4"
              }
            >
              <ImagePreview
                label="Original"
                url={edit.original_image_url}
                emptyLabel={
                  edit.operation_type === "text_to_image"
                    ? "Sem imagem original (texto para imagem)"
                    : "Original não disponível"
                }
              />
              <ImagePreview
                label="Resultado"
                url={edit.image_url}
                emptyLabel="Resultado ainda não gerado"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
