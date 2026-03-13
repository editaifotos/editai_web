import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/client-admin";

/**
 * GET /api/admin/users?search=&limit=20
 * Retorna lista mínima de usuários para autocomplete (id, name, email).
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const supabase = getSupabaseAdminClient();

    let query = supabase
      .from("users")
      .select("id, name, email")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Erro ao buscar usuários" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: (data ?? []).map((u) => ({
        id: u.id,
        name: u.name ?? null,
        email: u.email ?? null,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
