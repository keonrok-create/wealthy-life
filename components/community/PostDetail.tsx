"use client";
import { useState } from "react";
import { PostItem, useComments } from "@/lib/hooks/useCommunity";
import { Modal, Spinner } from "@/components/ui";
import { Badge } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const TAG_COLORS: Record<string, string> = {
  "재테크": "#C8A96E", "저축": "#4A9B8E", "투자": "#7B9EC8",
  "자기계발": "#A87BC8", "루틴": "#E07B6A", "독서": "#6AC87B",
};
const AVATARS = ["🦁","🐺","🦊","🐻","🐯","🦅","🦋","🐬","🦁","🐉"];

type Props = {
  post: PostItem | null;
  open: boolean;
  onClose: () => void;
  onLike: () => void;
  currentUserId?: string;
};

export default function PostDetail({ post, open, onClose, onLike, currentUserId }: Props) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { comments, loading, addComment, deleteComment } = useComments(post?.id ?? "");

  if (!post) return null;

  const avatar  = AVATARS[post.user_id.charCodeAt(0) % AVATARS.length];
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      {/* Post header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-xl shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gold-light font-bold text-base leading-snug">{post.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-navy-100 text-xs">{post.profiles?.name ?? "익명"}</span>
            <span className="text-navy-400">·</span>
            <span className="text-navy-200 text-xs">{timeAgo}</span>
            <Badge text={`#${post.tag}`} color={TAG_COLORS[post.tag] ?? "#C8A96E"} />
          </div>
        </div>
      </div>

      {post.content && (
        <div className="bg-navy-800 rounded-xl p-4 border border-navy-500 mb-4">
          <p className="text-gold-light text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Like */}
      <div className="flex items-center gap-4 pb-4 border-b border-navy-500 mb-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
            ${post.liked_by_me
              ? "bg-coral/15 border-coral/30 text-coral"
              : "bg-navy-800 border-navy-500 text-navy-100 hover:border-coral/30 hover:text-coral"
            }`}
        >
          {post.liked_by_me ? "❤️" : "🤍"} 좋아요 {post.likes}
        </button>
        <span className="text-navy-100 text-sm">💬 댓글 {comments.length}</span>
      </div>

      {/* Comments */}
      <div className="mb-4">
        <div className="text-gold-light font-bold text-sm mb-3">댓글</div>
        {loading ? <Spinner /> : (
          comments.length === 0 ? (
            <div className="text-center py-6 text-navy-200 text-sm">첫 댓글을 남겨보세요 💬</div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.map(c => {
                const cAvatar = AVATARS[c.user_id.charCodeAt(0) % AVATARS.length];
                const cTime   = formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ko });
                const isOwner = c.user_id === currentUserId;
                return (
                  <div key={c.id} className="flex gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-sm shrink-0">{cAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-gold-light text-xs font-bold">{c.profiles?.name ?? "익명"}</span>
                        <span className="text-navy-200 text-xs">{cTime}</span>
                        {isOwner && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-navy-300 hover:text-coral text-xs transition-all ml-auto"
                          >삭제</button>
                        )}
                      </div>
                      <p className="text-navy-100 text-sm leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Comment input */}
      <form onSubmit={handleComment} className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button type="submit" className="btn-primary text-sm shrink-0" disabled={submitting || !newComment.trim()}>
          {submitting ? "..." : "등록"}
        </button>
      </form>
    </Modal>
  );
}
