"use client";
import { useState } from "react";
import { Budget, Transaction } from "@/lib/types";
import { ProgressBar, Badge } from "@/components/ui";

const EXPENSE_CATEGORIES = ["식비","교통","주거/관리","문화/여가","의류/미용","의료/건강","교육/자기계발","통신","보험","기타지출"];

type Props = {
  budgets: Budget[];
  transactions: Transaction[];
  onUpsert: (category: string, amount: number) => Promise<void>;
};

export default function BudgetManager({ budgets, transactions, onUpsert }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  function getActual(category: string) {
    return transactions
      .filter(t => t.type === "expense" && t.category === category)
      .reduce((a, b) => a + b.amount, 0);
  }

  function getBudget(category: string) {
    return budgets.find(b => b.category === category)?.amount ?? 0;
  }

  async function handleSave(category: string) {
    const num = Number(editVal.replace(/,/g, ""));
    if (!num) return;
    await onUpsert(category, num);
    setEditing(null);
    setEditVal("");
  }

  const totalBudget = EXPENSE_CATEGORIES.reduce((a, c) => a + getBudget(c), 0);
  const totalActual = EXPENSE_CATEGORIES.reduce((a, c) => a + getActual(c), 0);
  const totalOver = totalActual > totalBudget;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-navy-800 rounded-xl p-4 border border-navy-500">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gold-light text-sm font-bold">이번 달 예산 총계</span>
          <Badge
            text={totalOver ? `${(totalActual - totalBudget).toLocaleString()}원 초과` : "예산 내"}
            color={totalOver ? "#E07B6A" : "#4A9B8E"}
          />
        </div>
        <ProgressBar value={totalActual} max={totalBudget || 1} color={totalOver ? "#E07B6A" : "#4A9B8E"} height={10} />
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-navy-100">예산 {totalBudget.toLocaleString()}원</span>
          <span className={totalOver ? "text-coral font-bold" : "text-teal font-bold"}>
            실제 {totalActual.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* Per-category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPENSE_CATEGORIES.map(cat => {
          const budget = getBudget(cat);
          const actual = getActual(cat);
          const over   = budget > 0 && actual > budget;
          const pct    = budget > 0 ? Math.min((actual / budget) * 100, 110) : 0;

          return (
            <div key={cat} className="bg-navy-800 rounded-xl p-4 border border-navy-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gold-light text-sm font-medium">{cat}</span>
                {editing === cat ? (
                  <div className="flex gap-1">
                    <input
                      className="w-28 bg-navy-700 border border-gold/40 rounded-lg px-2 py-1 text-xs text-gold-light focus:outline-none"
                      placeholder="예산 입력"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSave(cat)}
                      autoFocus
                    />
                    <button onClick={() => handleSave(cat)} className="text-xs bg-gold text-navy-900 px-2 py-1 rounded-lg font-bold">저장</button>
                    <button onClick={() => setEditing(null)} className="text-xs text-navy-100 px-1">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditing(cat); setEditVal(budget ? budget.toLocaleString() : ""); }}
                    className="text-xs text-navy-200 hover:text-gold transition-colors"
                  >
                    {budget ? `${(budget / 10000).toFixed(0)}만원 ✎` : "예산 설정 +"}
                  </button>
                )}
              </div>

              {budget > 0 ? (
                <>
                  <ProgressBar value={actual} max={budget} color={over ? "#E07B6A" : "#4A9B8E"} height={6} />
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-navy-200">{actual.toLocaleString()}원 사용</span>
                    <span className={over ? "text-coral" : "text-navy-100"}>
                      {over ? `${(actual - budget).toLocaleString()}원 초과` : `${(budget - actual).toLocaleString()}원 남음`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-navy-300 mt-1">
                  {actual > 0 ? `${actual.toLocaleString()}원 지출됨 (예산 미설정)` : "지출 없음"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
