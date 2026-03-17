"use client";
import { useState, useMemo } from "react";
import { useAssets, useLiabilities } from "@/lib/hooks/useStatements";
import { useTransactions } from "@/lib/hooks/useFinance";
import { Card, SectionTitle, PageHeader, Badge, Modal, Spinner } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subMonths } from "date-fns";
import { Asset, Liability } from "@/lib/types";

type Tab = "balance" | "income" | "cashflow";

const ASSET_CATEGORIES  = ["유동자산","투자자산","고정자산"] as const;
const LIAB_CATEGORIES   = ["유동부채","장기부채"]            as const;

const tooltipStyle = {
  contentStyle: { background: "#1a1a2e", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 10, color: "#e8d5b0", fontSize: 12 },
};

function ItemRow({ label, badge, amount, color, onDelete }: {
  label: string; badge: string; badgeColor: string; amount: number; color: string; onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-navy-800 rounded-xl border border-navy-500 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-gold-light text-sm font-medium truncate">{label}</div>
          <Badge text={badge} color={color} />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`font-bold font-mono text-sm`} style={{ color }}>{amount.toLocaleString()}원</span>
        {onDelete && (
          <button onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-navy-300 hover:text-coral text-lg transition-all">×</button>
        )}
      </div>
    </div>
  );
}

function AddItemModal({ open, onClose, onSubmit, type }: {
  open: boolean; onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  type: "asset" | "liability";
}) {
  const [name,     setName]     = useState("");
  const [category, setCategory] = useState(type === "asset" ? "유동자산" : "유동부채");
  const [amount,   setAmount]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const cats = type === "asset" ? ASSET_CATEGORIES : LIAB_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ name, category, amount: Number(amount.replace(/,/g, "")) });
    setName(""); setAmount(""); setCategory(cats[0]);
    onClose(); setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={type === "asset" ? "자산 추가" : "부채 추가"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">항목명</label>
          <input className="input" placeholder="예: 국민은행 예금" value={name}
            onChange={e => setName(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">분류</label>
          <div className="flex gap-2">
            {cats.map(c => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all
                  ${category === c ? "bg-gold/20 border-gold/50 text-gold" : "bg-navy-800 border-navy-400 text-navy-100"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-navy-100 text-xs mb-1.5 block">금액</label>
          <div className="relative">
            <input className="input pr-8" placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)} required />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-100 text-sm">원</span>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "저장 중..." : "추가"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function StatementsClient() {
  const [tab, setTab] = useState<Tab>("balance");
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiab,  setShowAddLiab]  = useState(false);

  const { assets,      loading: aLoading, add: addAsset,  remove: removeAsset }      = useAssets();
  const { liabilities, loading: lLoading, add: addLiab,   remove: removeLiab }       = useLiabilities();

  const currentMonth = format(new Date(), "yyyy-MM");
  const { transactions, loading: tLoading } = useTransactions(currentMonth);

  const totalAssets      = assets.reduce((a, b) => a + b.amount, 0);
  const totalLiabilities = liabilities.reduce((a, b) => a + b.amount, 0);
  const equity           = totalAssets - totalLiabilities;
  const debtRatio        = totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : "0";

  const income  = useMemo(() => transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0), [transactions]);
  const netIncome = income - expense;

  // Cashflow: group expenses by type (simplified)
  const fixedExpense    = transactions.filter(t => t.type === "expense" && ["주거/관리","통신","보험"].includes(t.category)).reduce((a,b) => a+b.amount, 0);
  const variableExpense = expense - fixedExpense;
  const investExpense   = transactions.filter(t => t.type === "expense" && ["교육/자기계발"].includes(t.category)).reduce((a,b) => a+b.amount, 0);

  // Multi-month cashflow chart
  const cashflowChart = Array.from({ length: 6 }, (_, i) => {
    const m = format(subMonths(new Date(), 5 - i), "M월");
    if (i === 5) return { month: m, operating: netIncome, investing: -investExpense, financing: 0 };
    return { month: m, operating: 0, investing: 0, financing: 0 };
  });

  const TABS = [
    { key: "balance" as Tab, label: "💼 재무상태표" },
    { key: "income"  as Tab, label: "📋 손익계산서" },
    { key: "cashflow"as Tab, label: "💧 현금흐름표" },
  ];

  const loading = aLoading || lLoading;

  return (
    <div>
      <PageHeader title="개인 재무제표" subtitle="재무상태표 · 손익계산서 · 현금흐름표" />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-navy-100 text-xs mb-1">총 자산</div>
          <div className="text-teal font-black text-xl font-mono">{(totalAssets/10000).toLocaleString()}만</div>
        </div>
        <div className="card text-center">
          <div className="text-navy-100 text-xs mb-1">총 부채</div>
          <div className="text-coral font-black text-xl font-mono">{(totalLiabilities/10000).toLocaleString()}만</div>
        </div>
        <div className="card text-center">
          <div className="text-navy-100 text-xs mb-1">순자산</div>
          <div className="text-gold font-black text-xl font-mono">{(equity/10000).toLocaleString()}만</div>
        </div>
        <div className="card text-center">
          <div className="text-navy-100 text-xs mb-1">부채비율</div>
          <div className={`font-black text-xl font-mono ${Number(debtRatio) < 30 ? "text-teal" : "text-coral"}`}>{debtRatio}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-navy-500">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${
              tab === t.key ? "border-gold text-gold" : "border-transparent text-navy-100 hover:text-gold-light"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* ── BALANCE SHEET ── */}
          {tab === "balance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Assets */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon="🟢" title="자산" />
                  <button onClick={() => setShowAddAsset(true)}
                    className="text-xs bg-teal/15 border border-teal/30 text-teal px-3 py-1.5 rounded-lg hover:bg-teal/25 transition-all">
                    + 추가
                  </button>
                </div>
                {ASSET_CATEGORIES.map(cat => {
                  const items = assets.filter(a => a.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat} className="mb-4">
                      <div className="text-navy-100 text-xs font-bold mb-2 px-1">{cat}</div>
                      <div className="space-y-2">
                        {items.map(a => (
                          <ItemRow key={a.id} label={a.name} badge={cat} badgeColor="#4A9B8E"
                            amount={a.amount} color="#4A9B8E" onDelete={() => removeAsset(a.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center px-4 py-3 bg-teal/10 border border-teal/30 rounded-xl mt-2">
                  <span className="text-teal font-bold text-sm">자산 합계</span>
                  <span className="text-teal font-black font-mono">{totalAssets.toLocaleString()}원</span>
                </div>
              </Card>

              {/* Liabilities + Equity */}
              <div className="space-y-5">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <SectionTitle icon="🔴" title="부채" />
                    <button onClick={() => setShowAddLiab(true)}
                      className="text-xs bg-coral/15 border border-coral/30 text-coral px-3 py-1.5 rounded-lg hover:bg-coral/25 transition-all">
                      + 추가
                    </button>
                  </div>
                  {liabilities.length === 0 ? (
                    <div className="text-center py-6 text-navy-200 text-sm">부채가 없어요 🎉</div>
                  ) : (
                    <div className="space-y-2">
                      {liabilities.map(l => (
                        <ItemRow key={l.id} label={l.name} badge={l.category} badgeColor="#E07B6A"
                          amount={l.amount} color="#E07B6A" onDelete={() => removeLiab(l.id)} />
                      ))}
                    </div>
                  )}
                  {liabilities.length > 0 && (
                    <div className="flex justify-between items-center px-4 py-3 bg-coral/10 border border-coral/30 rounded-xl mt-3">
                      <span className="text-coral font-bold text-sm">부채 합계</span>
                      <span className="text-coral font-black font-mono">{totalLiabilities.toLocaleString()}원</span>
                    </div>
                  )}
                </Card>

                <Card>
                  <SectionTitle icon="🟡" title="순자산 (자본)" />
                  <div className="text-center py-4">
                    <div className="text-navy-100 text-xs mb-2">자산 {(totalAssets/10000).toLocaleString()}만 − 부채 {(totalLiabilities/10000).toLocaleString()}만</div>
                    <div className="text-gold font-black text-4xl font-mono">{(equity/10000).toLocaleString()}<span className="text-xl">만원</span></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── INCOME STATEMENT ── */}
          {tab === "income" && (
            <Card>
              <SectionTitle icon="📋" title={`손익계산서 (${format(new Date(), "yyyy년 M월")})`} />
              {tLoading ? <Spinner /> : (
                <div className="space-y-2 max-w-lg">
                  {[
                    { label: "총 수입",           value: income,        color: "#4A9B8E", bold: true },
                    { label: "  근로/사업 소득",    value: income,        color: "#4A9B8E88" },
                    { label: "총 지출",           value: -expense,       color: "#E07B6A", bold: true },
                    { label: "  고정 지출",        value: -fixedExpense,  color: "#E07B6A88" },
                    { label: "  변동 지출",        value: -variableExpense, color: "#E07B6A88" },
                    { label: "━ 순이익 (저축가능)", value: netIncome,     color: "#C8A96E", bold: true, highlight: true },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between items-center px-4 py-3 rounded-xl
                      ${row.highlight ? "bg-gold/8 border border-gold/25" : "bg-navy-800 border border-navy-500"}`}>
                      <span className={`text-sm ${row.bold ? "text-gold-light font-bold" : "text-navy-100"}`}>{row.label}</span>
                      <span className="font-mono font-bold text-sm" style={{ color: row.color }}>
                        {row.value >= 0 ? "+" : ""}{row.value.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 text-xs text-navy-200 border-t border-navy-500 mt-3">
                    저축률: {income > 0 ? ((netIncome/income)*100).toFixed(1) : 0}% | 지출비율: {income > 0 ? ((expense/income)*100).toFixed(1) : 0}%
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── CASH FLOW ── */}
          {tab === "cashflow" && (
            <div className="space-y-5">
              <Card>
                <SectionTitle icon="💧" title="현금흐름표 (월별)" />
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={cashflowChart} barSize={18} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="month" tick={{ fill: "#7a7a9a", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#7a7a9a", fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} width={40} />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => `${v.toLocaleString()}원`} />
                    <Legend wrapperStyle={{ color: "#7a7a9a", fontSize: 12 }} />
                    <Bar dataKey="operating"  fill="#4A9B8E" radius={[4,4,0,0]} name="영업(저축)" />
                    <Bar dataKey="investing"  fill="#E07B6A" radius={[4,4,0,0]} name="투자" />
                    <Bar dataKey="financing"  fill="#7B9EC8" radius={[4,4,0,0]} name="재무(대출)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle icon="📌" title={`이번 달 현금흐름 요약 (${format(new Date(),"M월")})`} />
                {tLoading ? <Spinner /> : (
                  <div className="space-y-2 max-w-lg">
                    {[
                      { label: "영업활동 현금흐름 (저축)", value: netIncome,      color: "#4A9B8E" },
                      { label: "투자활동 현금흐름",        value: -investExpense, color: "#E07B6A" },
                      { label: "재무활동 현금흐름",        value: 0,              color: "#7B9EC8" },
                      { label: "순 현금 증감",            value: netIncome - investExpense, color: "#C8A96E", highlight: true },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between px-4 py-3 rounded-xl
                        ${row.highlight ? "bg-gold/8 border border-gold/25" : "bg-navy-800 border border-navy-500"}`}>
                        <span className="text-gold-light text-sm font-medium">{row.label}</span>
                        <span className="font-mono font-bold text-sm" style={{ color: row.color }}>
                          {row.value >= 0 ? "+" : ""}{row.value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      <AddItemModal open={showAddAsset} onClose={() => setShowAddAsset(false)} onSubmit={addAsset} type="asset" />
      <AddItemModal open={showAddLiab}  onClose={() => setShowAddLiab(false)}  onSubmit={addLiab}  type="liability" />
    </div>
  );
}
