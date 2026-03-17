import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/posts/[id]/like  — toggle like
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = params.id;

  // Check if already liked
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Unlike
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    await supabase.from("posts").update({ likes: supabase.rpc("decrement", { x: 1 }) }).eq("id", postId);
    // Simple decrement
    const { data: post } = await supabase.from("posts").select("likes").eq("id", postId).single();
    await supabase.from("posts").update({ likes: Math.max(0, (post?.likes ?? 1) - 1) }).eq("id", postId);
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    const { data: post } = await supabase.from("posts").select("likes").eq("id", postId).single();
    await supabase.from("posts").update({ likes: (post?.likes ?? 0) + 1 }).eq("id", postId);
    return NextResponse.json({ liked: true });
  }
}
