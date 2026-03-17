"use client";
import { useState } from "react";
import { Routine } from "@/lib/types";
import { Modal } from "@/components/ui";

const ICONS = ["✅","🏃","📚","🧘","💪","🌅","✍️","🎯","💧","🍎","🧠","🎸","🌿","🔥","⚡"];

type Props = {
  routines: Routine[];
  isCompleted: (id: string) => boolean;
  onToggle: (id: string) => void;
  onAdd: (title: string, icon: string) => Promise<void>;
  onDelete: (id: string) => void;
};

export default function RoutineChecker({ routines, isCompleted, onToggle, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd]   = useState(false);
  const [title, setTitle]       = useState("");
  const [icon, setIcon]         = useState("✅");
  const [loading, setLoading]   = useState(false);

  const done  = routines.filter(r => isCompleted(r.id)).length;
  const total = routines.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title.trim(), icon);
    setTitle(""); setIcon("✅"); setShowAdd(false);
    setLoading(false);
  }

  return (
    <div>
      {/* Progress summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e2e" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#C8A96E" strokeWidth="3"
                strokeDasharray={`${pct} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-gold text-xs font-bold">{pct}%</span>
          </div>
          <div>
            <div className="text-gold-light font-bold text-sm">오늘의 루틴</div>
            <div className="text-navy-100 text-xs">{done} / {total} 완료</div>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="text-xs bg-navy-700 border border-navy-400 hover:border-gold/40 text-navy-100 hover:text-gold px-3 py-1.5 rounded-lg transition-all">
          + 루틴 추가
        </button>
      </div>

      {/* Routine items */}
      {routines.length === 0 ? (
        <div className="text-center py-8 text-navy-200 text-sm">
          루틴을 추가해서 오늘 하루를 설계해보세요 🌅
        </div>
      ) : (
        <div className="space-y-2">
          {routines.map(r => {
            const done = isCompleted(r.id);
            return (
              <div key={r.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group
                  ${done
                    ? "bg-gold/8 border-gold/25 opacity-80"
                    : "bg-navy-800 border-navy-500 hover:border-navy-400"
                  }`}
                onClick={() => onToggle(r.id)}>
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${done ? "bg-gold border-gold" : "border-navy-300"}`}>
                  {done && <span className="text-navy-900 text-xs font-black">✓</span>}
                </div>
                <span className="text-lg">{r.icon}</span>
                <span className={`flex-1 text-sm font-medium transition-all
                  ${done ? "line-through text-navy-200" : "text-gold-light"}`}>
                  {r.title}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(r.id); }}
                  className="opacity-0 group-hover:opacity-100 text-navy-300 hover:text-coral text-lg transition-all">
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="루틴 추가">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-navy-100 text-xs mb-1.5 block">루틴 이름</label>
            <input className="input" placeholder="예: 아침 명상 10분" value={title}
              onChange={e => setTitle(e.target.value)} autoFocus required />
          </div>
          <div>
            <label className="text-navy-100 text-xs mb-2 block">아이콘 선택</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                    ${icon === ic ? "bg-gold/20 border border-gold/60" : "bg-navy-800 border border-navy-500 hover:border-navy-400"}`}>
                  {ic}
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
