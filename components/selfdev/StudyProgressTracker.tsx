"use client";
import { useState } from "react";
import { StudyProgress } from "@/lib/types";
import { ProgressBar, Modal } from "@/components/ui";

const COLORS = ["#C8A96E","#4A9B8E","#E07B6A","#7B9EC8","#A87BC8","#6AC87B","#E0A86A","#6A8AE0"];
const PRESET_SUBJECTS = ["주식기초","ETF전략","채권이해","부동산투자","세금&절세","재무제표분석","암호화폐","펀드투자"];

type Props = {
  progress: StudyProgress[];
  onUpsert: (subject: string, value: number) => Promise<void>;
  onDelete?: (subject: string) => void;
};

export default function StudyProgressTracker({ progress, onUpsert, onDelete }: Props) {
  const [showAdd, setShowAdd]   = useState(false);
  const [subject, setSubject]   = useState("");
  const [custom,  setCustom]    = useState("");
  const [editing, setEditing]   = useState<string | null>(null);
  const [editVal, setEditVal]   = useState(0);

  const avg = progress.length
    ? Math.round(progress.reduce((a, b) => a + b.progress, 0) / progress.length)
    : 0;

  async function handleAdd() {
    const s = subject === "custom" ? custom.trim() : subject;
    if (!s) return;
    await onUpsert(s, 0);
    setSubject(""); setCustom(""); setShowAdd(false);
  }

  async function handleEdit(s: string) {
    await onUpsert(s, editVal);
    setEditing(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-gold font-black text-2xl font-mono">{avg}%</div>
          <div className="text-navy-100 text-xs">전체 평균 달성도</div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="text-xs bg-navy-700 border border-navy-400 hover:border-gold/40 text-navy-100 hover:text-gold px-3 py-1.5 rounded-lg transition-all">
          + 주제 추가
        </button>
      </div>

      {progress.length === 0 ? (
        <div className="text-center py-8 text-navy-200 text-sm">투자 공부 주제를 추가해보세요 🎓</div>
      ) : (
        <div className="space-y-4">
          {progress.map((p, i) => (
            <div key={p.subject}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gold-light text-sm font-medium">{p.subject}</span>
                <div className="flex items-center gap-2">
                  {editing === p.subject ? (
                    <>
                      <input
                        type="range" min={0} max={100} value={editVal}
                        onChange={e => setEditVal(Number(e.target.value))}
                        className="w-24 accent-gold"
                      />
                      <span className="text-gold font-bold text-xs w-8">{editVal}%</span>
                      <button onClick={() => handleEdit(p.subject)}
                        className="text-xs bg-gold text-navy-900 px-2 py-0.5 rounded-lg font-bold">저장</button>
                      <button onClick={() => setEditing(null)}
                        className="text-xs text-navy-200">✕</button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: COLORS[i % COLORS.length] }} className="font-bold text-sm font-mono">
                        {p.progress}%
                      </span>
                      <button onClick={() => { setEditing(p.subject); setEditVal(p.progress); }}
                        className="text-navy-300 hover:text-gold text-xs transition-colors">✎</button>
                    </>
                  )}
                </div>
              </div>
              <ProgressBar value={p.progress} max={100} color={COLORS[i % COLORS.length]} height={8} />
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="공부 주제 추가">
        <div className="space-y-4">
          <div>
            <label className="text-navy-100 text-xs mb-2 block">주제 선택</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUBJECTS.map(s => (
                <button key={s} type="button" onClick={() => setSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                    ${subject === s ? "bg-gold/20 border-gold/50 text-gold" : "bg-navy-800 border-navy-500 text-navy-100 hover:border-navy-400"}`}>
                  {s}
                </button>
              ))}
              <button type="button" onClick={() => setSubject("custom")}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all
                  ${subject === "custom" ? "bg-gold/20 border-gold/50 text-gold" : "bg-navy-800 border-navy-500 text-navy-100 hover:border-navy-400"}`}>
                직접 입력
              </button>
            </div>
          </div>
          {subject === "custom" && (
            <div>
              <label className="text-navy-100 text-xs mb-1.5 block">주제 직접 입력</label>
              <input className="input" placeholder="예: 글로벌 매크로" value={custom}
                onChange={e => setCustom(e.target.value)} autoFocus />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">취소</button>
            <button onClick={handleAdd} className="btn-primary flex-1" disabled={!subject}>추가하기</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
