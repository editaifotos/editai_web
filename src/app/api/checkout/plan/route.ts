import { NextRequest, NextResponse } from "next/server";
import { getPlanForCheckout } from "@/services/checkout/plan-service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId") ?? searchParams.get("plan_id");

  if (!planId || !UUID_REGEX.test(planId)) {
    return NextResponse.json(
      { error: "planId inválido ou não informado." },
      { status: 400 }
    );
  }

  const plan = await getPlanForCheckout(planId);

  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  return NextResponse.json(plan);
}
