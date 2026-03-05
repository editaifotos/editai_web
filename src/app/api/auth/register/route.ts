import { NextRequest, NextResponse } from "next/server";
import { completeRegistration } from "@/features/auth/registration";

type RegisterBody = {
  userId: string;
  name: string;
  referralCode?: string | null;
};

export async function POST(request: NextRequest) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { userId, name, referralCode } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId é obrigatório." }, { status: 400 });
  }

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name é obrigatório." }, { status: 400 });
  }

  const result = await completeRegistration({
    userId,
    name: name.trim(),
    referralCode: referralCode ?? null,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
