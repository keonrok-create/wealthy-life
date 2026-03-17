"use client";
import { useState } from "react";
import { usePosts, PostItem } from "@/lib/hooks/useCommunity";
import { PageHeader, Spinner } from "@/components/ui";
import PostCard from "@/components/community/PostCard";
import PostDetail from "@/components/community/PostDetail";
import NewPostForm from "@/components/community/NewPostForm";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const TAGS = ["전체","재테크","저축","투자","자기계발","루틴","독서","부업"];

const TAG_COLORS: Record<string, string> = {
  "재테크": "#C8A96E", "저축": "#4A9B8E", "투자": "#7B9EC8",
  "자기계발": "#A87BC8", "루틴": "#E07B6A", "독서": "#6AC87B", "부업": "#E0A86A",
};

// Hot topics (static for now)
const HOT_TOPICS = [
  { tag: "저축", title: "자동이체로 강제 저축하는 방법" },
  { tag: "투자", title: "S&P500 ETF 장기투자 10년 후기" },
  { tag: "루틴", title: "미라클모닝 100일 챌린지 결과" },
  { tag: "재테크", title: "월급 200% 활용 가계부 템플릿" },
  { tag: "독서", title: "돈의 심리학 핵심 정리" },
];

export default function CommunityClient() {
  const [activeTag,    setActiveTag]    = useState("전체");
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [showNew,      setShowNew]      = useState(false);
  const [userId,       setUserId]       = useState<string>();

  const { posts, loading, addPost, deletePost, toggleLike } = usePosts(activeTag);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  function handleLike(post: PostItem) {
    toggleLike(post.id);
    if (selectedPost?.id === post.id) {
      setSelectedPost(prev => prev ? {
        ...prev,
        liked_by_me: !prev.liked_by_me,
        likes: prev.likes + (prev.liked_by_me ? -1 : 1),
      } : null);
    }
  }

  return (
    <div>
      <PageHeader
        title="커뮤니티"
        subtitle="재테크 & 자기계발 경험을 함께 나눠요"
        action={
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 text-sm">
            ✍️ 글쓰기
          </button>
        }
      />

      {/* Tag filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {TAGS.map(t => (
          <button key={t} onClick={() => setActiveTag(t)}
            className="shrink-0 text-xs px-4 py-2 rounded-full border transition-all"
            style={activeTag === t
              ? { background: `${TAG_COLORS[t] ?? "#C8A96E"}20`, borderColor: `${TAG_COLORS[t] ?? "#C8A96E"}60`, color: TAG_COLORS[t] ?? "#C8A96E", fontWeight: 700 }
              : { background: "#16162a", borderColor: "#2a2a3e", color: "#7a7a9a" }
            }>
            {t === "전체" ? "전체" : `#${t}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? <Spinner /> : posts.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-navy-100 text-sm">아직 글이 없어요</p>
              <p className="text-navy-200 text-xs mt-1">첫 번째 글을 남겨보세요!</p>
              <button onClick={() => setShowNew(true)} className="btn-primary mt-4 text-sm">
                첫 글 쓰기
              </button>
            </div>
          ) : posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post)}
              onDelete={() => deletePost(post.id)}
              onClick={() => setSelectedPost(post)}
              isOwner={post.user_id === userId}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hot topics */}
          <div className="card">
            <div className="text-gold-light font-bold text-sm mb-4">🔥 인기 주제</div>
            <div className="space-y-3">
              {HOT_TOPICS.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-navy-200 font-mono text-xs w-4 shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <div className="text-gold-light text-xs font-medium leading-snug">{t.title}</div>
                    <span className="text-[10px] mt-0.5 inline-block"
                      style={{ color: TAG_COLORS[t.tag] ?? "#C8A96E" }}>#{t.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tag stats */}
          <div className="card">
            <div className="text-gold-light font-bold text-sm mb-4">📊 태그별 게시글</div>
            <div className="space-y-2">
              {TAGS.filter(t => t !== "전체").map(t => {
                const count = posts.filter(p => p.tag === t).length;
                return (
                  <button key={t} onClick={() => setActiveTag(t)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-navy-700 transition-all">
                    <span className="text-xs font-medium" style={{ color: TAG_COLORS[t] ?? "#C8A96E" }}>#{t}</span>
                    <span className="text-navy-100 text-xs">{count}개</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Write CTA */}
          <div className="card text-center py-6">
            <div className="text-3xl mb-2">💡</div>
            <div className="text-gold-light font-bold text-sm mb-1">나의 경험을 나눠보세요</div>
            <div className="text-navy-100 text-xs mb-4">작은 팁 하나가 누군가에게 큰 도움이 됩니다</div>
            <button onClick={() => setShowNew(true)} className="btn-primary text-sm w-full">
              글쓰기
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PostDetail
        post={selectedPost}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onLike={() => selectedPost && handleLike(selectedPost)}
        currentUserId={userId}
      />
      <NewPostForm
        open={showNew}
        onClose={() => setShowNew(false)}
        onSubmit={addPost}
      />
    </div>
  );
}
