import { NextRequest, NextResponse } from "next/server";
import { getCreditPackForPurchase } from "@/services/credit-pack/credit-pack-service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "id inválido ou não informado." },
      { status: 400 }
    );
  }

  const pack = await getCreditPackForPurchase(id);

  if (!pack) {
    return NextResponse.json(
      { error: "Pacote não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json(pack);
}
