import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const month = req.nextUrl.searchParams.get("month");

  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (month) {
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-31`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json();
  const { type, amount, category, description, date } = body;

  const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type,
      amount: Number(amount),
      category,
      description,
      date,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
