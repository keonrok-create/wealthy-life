"use client";
import { useState, useEffect, useCallback } from "react";
import { Routine, RoutineLog, Book, HealthLog, StudyProgress } from "@/lib/types";
import { format } from "date-fns";

// ── Routines ──────────────────────────────────
export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [rRes, lRes] = await Promise.all([
      fetch("/api/routines"),
      fetch(`/api/routines/logs?date=${today}`),
    ]);
    const [r, l] = await Promise.all([rRes.json(), lRes.json()]);
    setRoutines(Array.isArray(r) ? r : []);
    setLogs(Array.isArray(l) ? l : []);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const toggle = async (routineId: string) => {
    const existing = logs.find(l => l.routine_id === routineId);
    const completed = !existing?.completed;
    await fetch("/api/routines/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routine_id: routineId, date: today, completed }),
    });
    setLogs(prev => {
      const filtered = prev.filter(l => l.routine_id !== routineId);
      return [...filtered, { ...existing!, routine_id: routineId, date: today, completed } as RoutineLog];
    });
  };

  const addRoutine = async (title: string, icon: string) => {
    await fetch("/api/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, icon }),
    });
    await fetch_();
  };

  const deleteRoutine = async (id: string) => {
    await fetch(`/api/routines/${id}`, { method: "DELETE" });
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const isCompleted = (routineId: string) =>
    logs.find(l => l.routine_id === routineId)?.completed ?? false;

  return { routines, logs, loading, toggle, addRoutine, deleteRoutine, isCompleted };
}

// ── Books ─────────────────────────────────────
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/books");
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const addBook = async (payload: Partial<Book>) => {
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetch_();
  };

  const updateBook = async (id: string, payload: Partial<Book>) => {
    await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetch_();
  };

  const deleteBook = async (id: string) => {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  return { books, loading, addBook, updateBook, deleteBook, refetch: fetch_ };
}

// ── Health ────────────────────────────────────
export function useHealth() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/health");
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const upsertLog = async (payload: Partial<HealthLog>) => {
    await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetch_();
  };

  return { logs, loading, upsertLog, refetch: fetch_ };
}

// ── Study ─────────────────────────────────────
export function useStudy() {
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/study");
    const data = await res.json();
    setProgress(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const upsert = async (subject: string, value: number) => {
    await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, progress: value }),
    });
    setProgress(prev => {
      const filtered = prev.filter(p => p.subject !== subject);
      return [...filtered, { subject, progress: value } as StudyProgress];
    });
  };

  return { progress, loading, upsert, refetch: fetch_ };
}
