import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";
import { supabaseConfig } from "@/config/supabase";

type TargetType = "all" | "plan" | "user";
type PlanFilter = "free" | "basic" | "pro";

interface Body {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  targetType: TargetType;
  planFilter?: PlanFilter;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Body;
    const { title, body: messageBody, targetType, planFilter, userId, data } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }
    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }
    if (!targetType || !["all", "plan", "user"].includes(targetType)) {
      return NextResponse.json(
        { error: "targetType deve ser all, plan ou user" },
        { status: 400 }
      );
    }

    if (targetType === "user" && !userId) {
      return NextResponse.json(
        { error: "userId é obrigatório quando targetType é user" },
        { status: 400 }
      );
    }
    if (targetType === "plan" && !planFilter) {
      return NextResponse.json(
        { error: "planFilter é obrigatório quando targetType é plan" },
        { status: 400 }
      );
    }
    if (targetType === "plan" && !["free", "basic", "pro"].includes(planFilter ?? "")) {
      return NextResponse.json(
        { error: "planFilter deve ser free, basic ou pro" },
        { status: 400 }
      );
    }

    const serviceRoleKey = supabaseConfig.serviceRoleKey;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseConfig.url,
      serviceRoleKey
    );

    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      "send-admin-notification",
      {
        body: {
          title: title.trim(),
          body: messageBody.trim(),
          data: data ?? {},
          targetType,
          ...(planFilter && { planFilter }),
          ...(userId && { userId }),
        },
      }
    );

    if (fnError) {
      console.error("send-admin-notification invoke error:", fnError);
      return NextResponse.json(
        { error: fnError.message || "Erro ao enviar notificação" },
        { status: 500 }
      );
    }

    const response = fnData as
      | { error?: string; count?: number; message?: string }
      | null;
    if (response?.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 400 }
      );
    }

    const count = typeof response?.count === "number" ? response.count : 0;
    return NextResponse.json({
      success: true,
      count,
      message: response?.message,
    });
  } catch (error) {
    console.error("Error in send-notification route:", error);
    return NextResponse.json(
      { error: "Erro ao processar envio de notificação" },
      { status: 500 }
    );
  }
}
