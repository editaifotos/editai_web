import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/asaas/payments";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId || typeof paymentId !== "string") {
    return NextResponse.json(
      { error: "paymentId é obrigatório." },
      { status: 400 }
    );
  }

  const result = await getPaymentStatus(paymentId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ status: result.status });
}
