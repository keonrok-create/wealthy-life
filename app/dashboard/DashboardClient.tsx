"use client";
import { useState } from "react";
import { useRoutines, useBooks, useHealth, useStudy } from "@/lib/hooks/useSelfDev";
import { Card, KpiCard, SectionTitle, PageHeader, Spinner } from "@/components/ui";
import RoutineChecker from "@/components/selfdev/RoutineChecker";
import BookTracker from "@/components/selfdev/BookTracker";
import HealthLogger from "@/components/selfdev/HealthLogger";
import StudyProgressTracker from "@/components/selfdev/StudyProgressTracker";

type Tab = "routine" | "book" | "health" | "study";

export default function DashboardClient() {
  const [tab, setTab] = useState<Tab>("routine");

  const { routines, loading: rLoading, toggle, addRoutine, deleteRoutine, isCompleted } = useRoutines();
  const { books,   loading: bLoading, addBook, updateBook, deleteBook }                = useBooks();
  const { logs,    loading: hLoading, upsertLog }                                      = useHealth();
  const { progress, loading: sLoading, upsert: upsertStudy }                           = useStudy();

  const donePct    = routines.length ? Math.round((routines.filter(r => isCompleted(r.id)).length / routines.length) * 100) : 0;
  const doneBooks  = books.filter(b => b.status === "done").length;
  const exerciseCnt= logs.filter(l => l.exercise_done).length;
  const studyAvg   = progress.length ? Math.round(progress.reduce((a,b) => a + b.progress, 0) / progress.length) : 0;

  const TABS: { key: Tab; label: string }[] = [
    { key: "routine", label: "🔥 루틴" },
    { key: "book",    label: "📚 독서" },
    { key: "health",  label: "❤️ 건강" },
    { key: "study",   label: "🎓 투자공부" },
  ];

  const loading = rLoading && bLoading && hLoading && sLoading;

  return (
    <div>
      <PageHeader title="자기계발 대시보드" subtitle="루틴 · 독서 · 건강 · 투자공부" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard icon="🔥" label="오늘 루틴 달성" value={`${donePct}%`}
          color={donePct >= 80 ? "text-teal" : donePct >= 50 ? "text-gold" : "text-coral"} />
        <KpiCard icon="📚" label="완독 권수"        value={`${doneBooks}권`}  color="text-teal" />
        <KpiCard icon="💪" label="운동 일수 (30일)" value={`${exerciseCnt}일`} color="text-gold" />
        <KpiCard icon="🎓" label="투자공부 달성도"  value={`${studyAvg}%`}    color="text-[#7B9EC8]" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-navy-500">
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
        <Card>
          {tab === "routine" && (
            <>
              <SectionTitle icon="🔥" title="오늘의 루틴 체크" />
              {rLoading ? <Spinner /> : (
                <RoutineChecker
                  routines={routines}
                  isCompleted={isCompleted}
                  onToggle={toggle}
                  onAdd={addRoutine}
                  onDelete={deleteRoutine}
                />
              )}
            </>
          )}

          {tab === "book" && (
            <>
              <SectionTitle icon="📚" title="독서 기록" />
              {bLoading ? <Spinner /> : (
                <BookTracker
                  books={books}
                  onAdd={addBook}
                  onUpdate={updateBook}
                  onDelete={deleteBook}
                />
              )}
            </>
          )}

          {tab === "health" && (
            <>
              <SectionTitle icon="❤️‍🔥" title="건강 관리" />
              {hLoading ? <Spinner /> : (
                <HealthLogger logs={logs} onUpsert={upsertLog} />
              )}
            </>
          )}

          {tab === "study" && (
            <>
              <SectionTitle icon="🎓" title="투자 공부 진도" />
              {sLoading ? <Spinner /> : (
                <StudyProgressTracker progress={progress} onUpsert={upsertStudy} />
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
