"use client";
import { useState, useEffect, useCallback } from "react";
import { Transaction, Budget, MonthlyStats, CategoryStats } from "@/lib/types";
import { format } from "date-fns";

// ── useTransactions ───────────────────────────
export function useTransactions(month: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?month=${month}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransactions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const addTransaction = async (payload: Omit<Transaction, "id" | "user_id" | "created_at">) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetch_();
  };

  const deleteTransaction = async (id: string) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, loading, error, refetch: fetch_, addTransaction, deleteTransaction };
}

// ── useBudgets ────────────────────────────────
export function useBudgets(month: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/budgets?month=${month}`);
    const data = await res.json();
    setBudgets(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [month]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const upsertBudget = async (category: string, amount: number) => {
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, amount, month }),
    });
    await fetch_();
  };

  return { budgets, loading, refetch: fetch_, upsertBudget };
}

// ── Derived stats helpers ─────────────────────

export function calcMonthStats(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  return { income, expense, save: income - expense };
}

export function calcCategoryStats(transactions: Transaction[]): CategoryStats[] {
  const map: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
