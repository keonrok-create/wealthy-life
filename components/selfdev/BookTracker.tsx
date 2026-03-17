"use client";
import { useState } from "react";
import { Book } from "@/lib/types";
import { ProgressBar, Badge, Modal } from "@/components/ui";

const STATUS_MAP = {
  todo:    { label: "읽을 예정", color: "#7a7a9a" },
  reading: { label: "읽는 중",   color: "#C8A96E" },
  done:    { label: "완독",      color: "#4A9B8E" },
};

type Props = {
  books: Book[];
  onAdd: (data: Partial<Book>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Book>) => Promise<void>;
  onDelete: (id: string) => void;
};

export default function BookTracker({ books, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd]   = useState(false);
  const [editing, setEditing]   = useState<Book | null>(null);
  const [form, setForm]         = useState({ title: "", author: "", total_pages: "", status: "todo" as Book["status"] });
  const [readPages, setReadPages] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  const doneCount    = books.filter(b => b.status === "done").length;
  const readingCount = books.filter(b => b.status === "reading").length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onAdd({ ...form, total_pages: Number(form.total_pages), read_pages: 0 });
    setForm({ title: "", author: "", total_pages: "", status: "todo" });
    setShowAdd(false);
    setLoading(false);
  }

  async function handlePageUpdate(book: Book) {
    const pages = Number(readPages[book.id]);
    if (isNaN(pages)) return;
    const status: Book["status"] = pages >= book.total_pages ? "done" : "reading";
    await onUpdate(book.id, {
      read_pages: pages,
      status,
      finished_at: status === "done" ? new Date().toISOString().slice(0, 10) : undefined,
    });
    setReadPages(prev => ({ ...prev, [book.id]: "" }));
  }

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal inline-block" />
          <span className="text-navy-100">완독 <span className="text-teal font-bold">{doneCount}권</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          <span className="text-navy-100">읽는 중 <span className="text-gold font-bold">{readingCount}권</span></span>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="ml-auto text-xs bg-navy-700 border border-navy-400 hover:border-gold/40 text-navy-100 hover:text-gold px-3 py-1.5 rounded-lg transition-all">
          + 책 추가
        </button>
      </div>

      {/* Book list */}
      {books.length === 0 ? (
        <div className="text-center py-8 text-navy-200 text-sm">읽고 싶은 책을 추가해보세요 📚</div>
      ) : (
        <div className="space-y-3">
          {books.map(book => (
            <div key={book.id} className="bg-navy-800 rounded-xl p-4 border border-navy-500 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-gold-light font-bold text-sm truncate">{book.title}</div>
                  <div className="text-navy-100 text-xs mt-0.5">{book.author}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge text={STATUS_MAP[book.status].label} color={STATUS_MAP[book.status].color} />
                  <button onClick={() => onDelete(book.id)}
                    className="opacity-0 group-hover:opacity-100 text-navy-300 hover:text-coral text-lg transition-all">×</button>
                </div>
              </div>

              {book.status !== "todo" && (
                <>
                  <ProgressBar
                    value={book.read_pages} max={book.total_pages || 1}
                    color={book.status === "done" ? "#4A9B8E" : "#C8A96E"}
                    height={6}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-navy-200 text-xs">{book.read_pages} / {book.total_pages}p</span>
                    {book.status === "reading" && (
                      <div className="flex items-center gap-1">
                        <input
                          className="w-20 bg-navy-700 border border-navy-400 rounded-lg px-2 py-0.5 text-xs text-gold-light focus:outline-none focus:border-gold/40"
                          placeholder="현재 페이지"
                          value={readPages[book.id] ?? ""}
                          onChange={e => setReadPages(prev => ({ ...prev, [book.id]: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && handlePageUpdate(book)}
                        />
                        <button onClick={() => handlePageUpdate(book)}
                          className="text-xs bg-gold/20 border border-gold/40 text-gold px-2 py-0.5 rounded-lg hover:bg-gold/30 transition-all">
                          업데이트
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {book.status === "todo" && (
                <button onClick={() => onUpdate(book.id, { status: "reading", started_at: new Date().toISOString().slice(0,10) })}
                  className="mt-2 text-xs text-gold hover:text-gold-light transition-colors">
                  읽기 시작 →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="책 추가">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-navy-100 text-xs mb-1.5 block">책 제목</label>
            <input className="input" placeholder="책 제목" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
          </div>
          <div>
            <label className="text-navy-100 text-xs mb-1.5 block">저자</label>
            <input className="input" placeholder="저자명" value={form.author}
              onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
          </div>
          <div>
            <label className="text-navy-100 text-xs mb-1.5 block">총 페이지 수</label>
            <input className="input" type="number" placeholder="예: 320" value={form.total_pages}
              onChange={e => setForm(p => ({ ...p, total_pages: e.target.value }))} required />
          </div>
          <div>
            <label className="text-navy-100 text-xs mb-1.5 block">상태</label>
            <div className="flex gap-2">
              {(["todo","reading","done"] as const).map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                    ${form.status === s ? "bg-gold/20 border-gold/50 text-gold" : "bg-navy-800 border-navy-400 text-navy-100"}`}>
                  {STATUS_MAP[s].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
