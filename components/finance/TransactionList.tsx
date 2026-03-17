"use client";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const CATEGORY_ICONS: Record<string, string> = {
  "식비": "🍚", "교통": "🚇", "주거/관리": "🏠", "문화/여가": "🎬",
  "의류/미용": "👗", "의료/건강": "💊", "교육/자기계발": "📚",
  "통신": "📱", "보험": "🛡️", "기타지출": "📦",
  "근로소득": "💼", "부업/프리랜서": "💻", "투자수익": "📈",
  "용돈/선물": "🎁", "기타수입": "💰",
};

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};

export default function TransactionList({ transactions, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-14 text-navy-100">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">이번 달 거래 내역이 없어요</p>
        <p className="text-xs mt-1 text-navy-200">위 버튼을 눌러 첫 거래를 입력해보세요</p>
      </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    (acc[t.date] = acc[t.date] ?? []).push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      {sortedDates.map(date => {
        const dayIncome  = grouped[date].filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
        const dayExpense = grouped[date].filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-gold text-xs font-bold">
                {format(new Date(date), "M월 d일 (EEE)", { locale: ko })}
              </span>
              <div className="flex gap-3 text-xs">
                {dayIncome  > 0 && <span className="text-teal">+{dayIncome.toLocaleString()}</span>}
                {dayExpense > 0 && <span className="text-coral">-{dayExpense.toLocaleString()}</span>}
              </div>
            </div>

            {/* Transactions */}
            <div className="space-y-2">
              {grouped[date].map(t => (
                <div key={t.id}
                  className="flex items-center gap-3 bg-navy-800 rounded-xl px-4 py-3
                             border border-navy-500 hover:border-navy-400 transition-colors group">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center text-lg shrink-0">
                    {CATEGORY_ICONS[t.category] ?? "💳"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-gold-light text-sm font-medium truncate">
                      {t.description || t.category}
                    </div>
                    <div className="text-navy-100 text-xs">{t.category}</div>
                  </div>

                  {/* Amount */}
                  <div className={`text-sm font-bold font-mono ${
                    t.type === "income" ? "text-teal" : "text-coral"
                  }`}>
                    {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}원
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm("이 거래를 삭제할까요?")) onDelete(t.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-navy-200
                               hover:text-coral transition-all text-lg ml-1">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
