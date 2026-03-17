"use client";
import { PostItem } from "@/lib/hooks/useCommunity";
import { Badge } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const TAG_COLORS: Record<string, string> = {
  "재테크":   "#C8A96E",
  "저축":     "#4A9B8E",
  "투자":     "#7B9EC8",
  "자기계발": "#A87BC8",
  "루틴":     "#E07B6A",
  "독서":     "#6AC87B",
  "부업":     "#E0A86A",
};

const AVATARS = ["🦁","🐺","🦊","🐻","🐯","🦅","🦋","🐬","🦁","🐉"];

type Props = {
  post: PostItem;
  onLike: () => void;
  onDelete?: () => void;
  onClick: () => void;
  isOwner?: boolean;
};

export default function PostCard({ post, onLike, onDelete, onClick, isOwner }: Props) {
  const avatar = AVATARS[post.user_id.charCodeAt(0) % AVATARS.length];
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko });

  return (
    <div
      className="card cursor-pointer hover:border-gold/25 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-xl shrink-0">
            {avatar}
          </div>
          <div className="min-w-0">
            <div className="text-gold-light font-bold text-sm leading-snug truncate">{post.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-navy-100 text-xs">{post.profiles?.name ?? "익명"}</span>
              <span className="text-navy-400 text-xs">·</span>
              <span className="text-navy-200 text-xs">{timeAgo}</span>
            </div>
          </div>
        </div>
        <Badge text={`#${post.tag}`} color={TAG_COLORS[post.tag] ?? "#C8A96E"} />
      </div>

      {post.content && (
        <p className="text-navy-100 text-xs leading-relaxed mb-3 line-clamp-2">{post.content}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-navy-500">
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onLike(); }}
            className={`flex items-center gap-1.5 text-xs transition-colors
              ${post.liked_by_me ? "text-coral" : "text-navy-100 hover:text-coral"}`}
          >
            <span>{post.liked_by_me ? "❤️" : "🤍"}</span>
            <span>{post.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-navy-100 text-xs">
            <span>💬</span>
            <span>{post.comment_count}</span>
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); if (confirm("글을 삭제할까요?")) onDelete(); }}
            className="opacity-0 group-hover:opacity-100 text-navy-300 hover:text-coral text-xs transition-all"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
