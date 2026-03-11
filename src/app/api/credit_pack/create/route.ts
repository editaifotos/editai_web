import { NextRequest, NextResponse } from "next/server";
import {
  createCreditPackPayment,
  createCreditPackPaymentPix,
} from "@/services/credit-pack/create-credit-pack-service";

type CreateBody = {
  paymentMethod?: "CREDIT_CARD" | "PIX";
  packId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiry: string;
    ccv: string;
  };
  address?: {
    postalCode: string;
    number: string;
    complement?: string | null;
  };
};

function getRemoteIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "127.0.0.1";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(request: NextRequest) {
  let body: CreateBody;

  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const paymentMethod = body.paymentMethod ?? "CREDIT_CARD";
  const { packId, name, email, phone, cpf, creditCard, address } = body;

  if (!packId || typeof packId !== "string") {
    return NextResponse.json(
      { error: "packId é obrigatório." },
      { status: 400 }
    );
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name é obrigatório." }, { status: 400 });
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório." }, { status: 400 });
  }
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "phone é obrigatório." }, { status: 400 });
  }
  if (!cpf || typeof cpf !== "string") {
    return NextResponse.json({ error: "cpf é obrigatório." }, { status: 400 });
  }

  if (paymentMethod === "PIX") {
    let result;
    try {
      result = await createCreditPackPaymentPix({
        packId,
        name,
        email,
        phone,
        cpf,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro interno.";
      console.error("[credit_pack/create] Erro inesperado PIX:", msg, err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    if (!result.success) {
      console.error("[credit_pack/create] Falha PIX:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes("não encontrado") ? 404 : 400 }
      );
    }

    return NextResponse.json({ success: true, paymentId: result.paymentId });
  }

  if (!creditCard || typeof creditCard !== "object") {
    return NextResponse.json(
      { error: "Dados do cartão são obrigatórios." },
      { status: 400 }
    );
  }
  if (!address || typeof address !== "object") {
    return NextResponse.json(
      { error: "Endereço é obrigatório." },
      { status: 400 }
    );
  }
  if (!address.postalCode || typeof address.postalCode !== "string") {
    return NextResponse.json({ error: "CEP é obrigatório." }, { status: 400 });
  }
  if (!address.number || typeof address.number !== "string") {
    return NextResponse.json(
      { error: "Número do endereço é obrigatório." },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await createCreditPackPayment({
      packId,
      name,
      email,
      phone,
      cpf,
      creditCard: {
        holderName: creditCard.holderName ?? "",
        number: creditCard.number ?? "",
        expiry: creditCard.expiry ?? "",
        ccv: creditCard.ccv ?? "",
      },
      address: {
        postalCode: address.postalCode,
        number: address.number,
        complement: address.complement ?? null,
      },
      remoteIp: getRemoteIp(request),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno.";
    console.error("[credit_pack/create] Erro inesperado:", msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!result.success) {
    console.error("[credit_pack/create] Falha:", result.error);
    return NextResponse.json(
      { error: result.error },
      { status: result.error.includes("não encontrado") ? 404 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
