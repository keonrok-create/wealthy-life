"use client";
import { useState, useMemo } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useTransactions, useBudgets, calcMonthStats, calcCategoryStats } from "@/lib/hooks/useFinance";
import { Card, KpiCard, SectionTitle, PageHeader, Spinner } from "@/components/ui";
import TransactionForm from "@/components/finance/TransactionForm";
import TransactionList from "@/components/finance/TransactionList";
import BudgetManager from "@/components/finance/BudgetManager";
import { MonthlyChart, CategoryPieChart, SavingsBarChart } from "@/components/charts/FinanceCharts";

type Tab = "overview" | "transactions" | "budget";

export default function FinanceClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tab, setTab] = useState<Tab>("overview");
  const [showForm, setShowForm] = useState(false);

  const month = format(currentDate, "yyyy-MM");
  const monthLabel = format(currentDate, "yyyy년 M월", { locale: ko });

  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions(month);
  const { budgets, upsertBudget } = useBudgets(month);

  const stats = useMemo(() => calcMonthStats(transactions), [transactions]);
  const categoryStats = useMemo(() => calcCategoryStats(transactions), [transactions]);
  const saveRate = stats.income > 0 ? Math.round((stats.save / stats.income) * 100) : 0;

  // Build last-6-months chart data (simplified: only current month real data)
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(currentDate, 5 - i));
    return months.map(d => {
      const m = format(d, "M월");
      if (format(d, "yyyy-MM") === month) {
        return { month: m, ...stats };
      }
      return { month: m, income: 0, expense: 0, save: 0 };
    });
  }, [currentDate, month, stats]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",      label: "📊 현황" },
    { key: "transactions",  label: "📋 거래내역" },
    { key: "budget",        label: "🎯 예산관리" },
  ];

  return (
    <div>
      <PageHeader
        title="재테크 대시보드"
        subtitle="가계부 · 예산 · 지출 현황"
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <span className="text-lg">+</span> 거래 입력
          </button>
        }
      />

      {/* Month navigator */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
          className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-400 text-gold-light hover:border-gold/40 transition-all flex items-center justify-center">
          ‹
        </button>
        <span className="text-gold-light font-bold text-base min-w-[90px] text-center">{monthLabel}</span>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
          className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-400 text-gold-light hover:border-gold/40 transition-all flex items-center justify-center">
          ›
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard icon="💰" label="이번 달 수입" value={`${(stats.income / 10000).toLocaleString()}만`} color="text-teal" />
        <KpiCard icon="💸" label="이번 달 지출" value={`${(stats.expense / 10000).toLocaleString()}만`} color="text-coral" />
        <KpiCard icon="🏦" label="저축 가능액"  value={`${(stats.save / 10000).toLocaleString()}만`}   color="text-gold" />
        <KpiCard icon="📊" label="저축률"        value={`${saveRate}%`} color={saveRate >= 30 ? "text-teal" : "text-coral"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-navy-500 pb-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${
              tab === t.key
                ? "border-gold text-gold"
                : "border-transparent text-navy-100 hover:text-gold-light"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <SectionTitle icon="📈" title="수입 · 지출 추이" />
                  <MonthlyChart data={chartData} />
                </Card>
                <Card>
                  <SectionTitle icon="🧾" title="지출 구성" />
                  <CategoryPieChart data={categoryStats} />
                </Card>
              </div>
              <Card>
                <SectionTitle icon="💰" title="월별 저축액" />
                <SavingsBarChart data={chartData} />
              </Card>

              {/* Top expenses */}
              {categoryStats.length > 0 && (
                <Card>
                  <SectionTitle icon="🏆" title="지출 TOP 카테고리" />
                  <div className="space-y-3">
                    {categoryStats.slice(0, 5).map((cat, i) => {
                      const pct = stats.expense > 0 ? (cat.value / stats.expense) * 100 : 0;
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gold-light">{i + 1}. {cat.name}</span>
                            <span className="text-coral font-mono font-bold">{cat.value.toLocaleString()}원</span>
                          </div>
                          <div className="bg-navy-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full bg-coral/60 transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {tab === "transactions" && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionTitle icon="📋" title={`${monthLabel} 거래내역`} />
                <span className="text-navy-100 text-xs">{transactions.length}건</span>
              </div>
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </Card>
          )}

          {/* BUDGET TAB */}
          {tab === "budget" && (
            <div>
              <div className="mb-4">
                <SectionTitle icon="🎯" title={`${monthLabel} 예산 관리`} />
                <p className="text-navy-100 text-xs -mt-3">카테고리를 클릭해서 예산을 설정하세요</p>
              </div>
              <BudgetManager budgets={budgets} transactions={transactions} onUpsert={upsertBudget} />
            </div>
          )}
        </>
      )}

      {/* Transaction form modal */}
      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
}
