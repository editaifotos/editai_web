"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
);

type TargetType = "all" | "plan" | "user";
type PlanFilter = "free" | "basic" | "pro";

interface UserOption {
  id: string;
  name: string | null;
  email: string | null;
}

type EmojiTarget = "title" | "body";

export function SendNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("free");
  const [userId, setUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [emojiTarget, setEmojiTarget] = useState<EmojiTarget | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = useCallback((emoji: string, target: EmojiTarget) => {
    if (target === "title") {
      const input = titleRef.current;
      if (input) {
        const start = input.selectionStart ?? title.length;
        const end = input.selectionEnd ?? title.length;
        const newValue = title.slice(0, start) + emoji + title.slice(end);
        setTitle(newValue);
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
      }
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? body.length;
        const end = textarea.selectionEnd ?? body.length;
        const newValue = body.slice(0, start) + emoji + body.slice(end);
        setBody(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
      }
    }
    setEmojiTarget(null);
  }, [title, body]);

  const fetchUsers = useCallback(async (search: string) => {
    if (!search.trim()) {
      setUserOptions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(search)}&limit=20`
      );
      if (!res.ok) return;
      const data = await res.json();
      setUserOptions(data.users ?? []);
      setUserSearchOpen(true);
    } catch {
      setUserOptions([]);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!userSearch.trim()) {
      setUserOptions([]);
      setUserSearchOpen(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(userSearch);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [userSearch, fetchUsers]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setUserSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (u: UserOption) => {
    setUserId(u.id);
    setUserSearch(u.email || u.name || u.id);
    setUserSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (!title.trim()) {
      setError("Título é obrigatório.");
      return;
    }
    if (!body.trim()) {
      setError("Mensagem é obrigatória.");
      return;
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const effectiveUserId =
      targetType === "user"
        ? userId || (uuidRegex.test(userSearch.trim()) ? userSearch.trim() : null)
        : null;
    if (targetType === "user" && !effectiveUserId) {
      setError("Selecione ou informe o ID do usuário.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          targetType,
          ...(targetType === "plan" && { planFilter }),
          ...(targetType === "user" &&
            effectiveUserId && { userId: effectiveUserId }),
          data: {},
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar notificação.");
        return;
      }
      setSuccessCount(data.count ?? 0);
      setTitle("");
      setBody("");
      setUserId("");
      setUserSearch("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar notificação."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <div className="flex gap-2">
          <Input
            ref={titleRef}
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Novidade no app"
            maxLength={200}
            className="flex-1"
          />
          <Popover
            open={emojiTarget === "title"}
            onOpenChange={(open) => setEmojiTarget(open ? "title" : null)}
          >
            <PopoverTrigger
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-input bg-transparent hover:bg-muted"
            >
              <Smile className="size-4" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="end">
              <EmojiPicker
                onEmojiClick={(data) => insertEmoji(data.emoji, "title")}
                searchPlaceholder="Buscar emoji"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Mensagem</Label>
        <div className="flex gap-2">
          <Textarea
            ref={bodyRef}
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Texto da notificação..."
            rows={4}
            maxLength={500}
            className="flex-1"
          />
          <Popover
            open={emojiTarget === "body"}
            onOpenChange={(open) => setEmojiTarget(open ? "body" : null)}
          >
            <PopoverTrigger
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-input bg-transparent hover:bg-muted"
            >
              <Smile className="size-4" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="end">
              <EmojiPicker
                onEmojiClick={(data) => insertEmoji(data.emoji, "body")}
                searchPlaceholder="Buscar emoji"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Destinatários</span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              value="all"
              checked={targetType === "all"}
              onChange={() => setTargetType("all")}
              className="size-4"
            />
            Todos os usuários
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              value="plan"
              checked={targetType === "plan"}
              onChange={() => setTargetType("plan")}
              className="size-4"
            />
            Por plano
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetType"
              value="user"
              checked={targetType === "user"}
              onChange={() => setTargetType("user")}
              className="size-4"
            />
            Usuário específico
          </label>
        </div>
      </div>

      {targetType === "plan" && (
        <div className="space-y-2">
          <Label htmlFor="planFilter">Plano</Label>
          <Select
            value={planFilter}
            onValueChange={(v) => setPlanFilter(v as PlanFilter)}
          >
            <SelectTrigger id="planFilter" className="w-full max-w-xs">
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">PRO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {targetType === "user" && (
        <div className="space-y-2" ref={listRef}>
          <Label htmlFor="userSearch">Usuário</Label>
          <div className="relative max-w-md">
            <Input
              id="userSearch"
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                if (!e.target.value) setUserId("");
              }}
              placeholder="Busque por nome ou e-mail..."
              autoComplete="off"
            />
            {userSearchOpen && userOptions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-md z-10">
                {userOptions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                      "flex flex-col"
                    )}
                    onClick={() => handleSelectUser(u)}
                  >
                    <span className="font-medium">
                      {u.name || u.email || u.id}
                    </span>
                    {u.email && u.email !== (u.name || "") && (
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Ou cole o ID do usuário.{" "}
            <Link href="/admin/users" className="text-primary underline">
              Ver lista de usuários
            </Link>
          </p>
          {userId && (
            <p className="text-xs text-muted-foreground">
              ID selecionado: <code className="rounded bg-muted px-1">{userId}</code>
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {successCount !== null && (
        <p className="text-sm text-green-600 dark:text-green-500">
          Notificação enviada com sucesso. {successCount} dispositivo(s)
          notificado(s).
        </p>
      )}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar notificação"}
        </Button>
      </div>
    </form>
  );
}
