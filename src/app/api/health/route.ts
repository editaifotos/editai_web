import { NextResponse } from "next/server";
import { healthService } from "@/services";
import type { HealthResponse } from "@/types";

export async function GET() {
  const result = (await healthService.check()) as HealthResponse;
  return NextResponse.json(result, { status: 200 });
}

