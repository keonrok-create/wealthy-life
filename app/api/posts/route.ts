import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts?tag=재테크&limit=20&offset=0
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tag    = req.nextUrl.searchParams.get("tag");
  const limit  = Number(req.nextUrl.searchParams.get("limit")  ?? 20);
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);

  let query = supabase
    .from("posts")
    .select(`*, profiles(name, avatar_url), comments(count), post_likes(user_id)`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tag && tag !== "전체") query = query.eq("tag", tag);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach liked_by_me flag
  const enriched = (data ?? []).map(p => ({
    ...p,
    comment_count: p.comments?.[0]?.count ?? 0,
    liked_by_me: (p.post_likes ?? []).some((l: any) => l.user_id === user.id),
  }));

  return NextResponse.json(enriched);
}

// POST /api/posts
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tag } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "제목을 입력해주세요" }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: user.id, title: title.trim(), content: content ?? "", tag: tag ?? "재테크" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
