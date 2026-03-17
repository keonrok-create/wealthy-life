"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";

const EXPENSE_CATEGORIES = ["식비","교통","주거/관리","문화/여가","의류/미용","의료/건강","교육/자기계발","통신","보험","기타지출"];
const INCOME_CATEGORIES  = ["근로소득","부업/프리랜서","투자수익","용돈/선물","기타수입"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};

export default function TransactionForm({ open, onClose, onSubmit }: Props) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) { setError("카테고리를 선택해주세요"); return; }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ type, amount: Number(amount.replace(/,/g, "")), category, description, date });
      // reset
      setAmount(""); setCategory(""); setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(val: string) {
    const num = val.replace(/[^0-9]/g, "");
    return num ? Number(num).toLocaleString() : "";
  }

  return (
    <Modal open={open} onClose={onClose} title="거래 입력">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-navy-400">
          {(["expense", "income"] as const).map(t => (
            <button key={t} type="button"
              onClick={() => { setType(t); setCategory(""); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                type === t
                  ? t === "expense" ? "bg-coral text-white" : "bg-teal text-white"
                  : "bg-navy-800 text-navy-100 hover:text-gold-light"
              }`}>
              {t === "expense" ? "💸 지출" : "💰 수입"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">금액</label>
          <div className="relative">
            <input
              className="input pr-8"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(formatAmount(e.target.value))}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-100 text-sm">원</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  category === cat
                    ? "bg-gold/20 border-gold/60 text-gold font-bold"
                    : "bg-navy-800 border-navy-400 text-navy-100 hover:border-gold/30"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">메모 (선택)</label>
          <input className="input" placeholder="내용을 입력하세요" value={description}
            onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Date */}
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">날짜</label>
          <input type="date" className="input" value={date}
            onChange={e => setDate(e.target.value)} required />
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
          <button type="submit" disabled={loading}
            className={`flex-1 font-bold rounded-xl px-5 py-2.5 transition-all ${
              type === "expense" ? "bg-coral hover:bg-coral/80" : "bg-teal hover:bg-teal/80"
            } text-white`}>
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
