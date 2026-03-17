"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";

const TAGS = ["재테크","저축","투자","자기계발","루틴","독서","부업"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, tag: string) => Promise<void>;
};

export default function NewPostForm({ open, onClose, onSubmit }: Props) {
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [tag,     setTag]     = useState("재테크");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const TAG_COLORS: Record<string, string> = {
    "재테크": "#C8A96E", "저축": "#4A9B8E", "투자": "#7B9EC8",
    "자기계발": "#A87BC8", "루틴": "#E07B6A", "독서": "#6AC87B", "부업": "#E0A86A",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("제목을 입력해주세요"); return; }
    setLoading(true); setError("");
    try {
      await onSubmit(title.trim(), content.trim(), tag);
      setTitle(""); setContent(""); setTag("재테크");
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="✍️ 글쓰기">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tag */}
        <div>
          <label className="text-navy-100 text-xs mb-2 block">태그 선택</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t} type="button" onClick={() => setTag(t)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={tag === t
                  ? { background: `${TAG_COLORS[t]}20`, borderColor: `${TAG_COLORS[t]}60`, color: TAG_COLORS[t] }
                  : { background: "#0d0d1a", borderColor: "#2a2a3e", color: "#7a7a9a" }
                }>
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">제목</label>
          <input
            className="input"
            placeholder="글 제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            autoFocus
            required
          />
          <div className="text-right text-navy-200 text-xs mt-1">{title.length}/100</div>
        </div>

        {/* Content */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">내용 (선택)</label>
          <textarea
            className="input resize-none"
            rows={5}
            placeholder="자유롭게 경험을 나눠보세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
          />
          <div className="text-right text-navy-200 text-xs mt-1">{content.length}/2000</div>
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading || !title.trim()}>
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
