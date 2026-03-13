import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/services/checkout/create-checkout-service";

type CreateBody = {
  planId: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  foreignCustomer?: boolean;
  creditCard: {
    holderName: string;
    number: string;
    expiry: string;
    ccv: string;
  };
  address: {
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

  const { planId, name, email, phone, cpf, foreignCustomer, creditCard, address } = body;
  const isForeign = !!foreignCustomer;

  if (!planId || typeof planId !== "string") {
    return NextResponse.json(
      { error: "planId é obrigatório." },
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
  if (!isForeign && (!cpf || typeof cpf !== "string")) {
    return NextResponse.json({ error: "cpf é obrigatório." }, { status: 400 });
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
    result = await createCheckout({
      planId,
      name,
      email,
      phone,
      cpf: cpf ?? "",
      foreignCustomer: isForeign,
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
    console.error("[checkout/create] Erro inesperado:", msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!result.success) {
    console.error("[checkout/create] Falha:", result.error);
    return NextResponse.json(
      { error: result.error },
      { status: result.error.includes("não encontrado") ? 404 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
