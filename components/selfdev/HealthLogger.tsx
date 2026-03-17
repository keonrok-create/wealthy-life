"use client";
import { useState } from "react";
import { HealthLog } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type Props = {
  logs: HealthLog[];
  onUpsert: (data: Partial<HealthLog>) => Promise<void>;
};

export default function HealthLogger({ logs, onUpsert }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find(l => l.date === today);

  const [weight,   setWeight]   = useState(todayLog?.weight?.toString() ?? "");
  const [sleep,    setSleep]    = useState(todayLog?.sleep_hours?.toString() ?? "");
  const [exercise, setExercise] = useState(todayLog?.exercise_done ?? false);
  const [memo,     setMemo]     = useState(todayLog?.memo ?? "");
  const [saved,    setSaved]    = useState(false);

  async function handleSave() {
    await onUpsert({
      date: today,
      weight: weight ? Number(weight) : undefined,
      sleep_hours: sleep ? Number(sleep) : undefined,
      exercise_done: exercise,
      memo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Chart data — last 14 days
  const chartData = logs.slice(0, 14).reverse().map(l => ({
    date: format(new Date(l.date), "M/d", { locale: ko }),
    weight: l.weight,
    sleep:  l.sleep_hours,
  }));

  // Stats
  const exerciseDays = logs.filter(l => l.exercise_done).length;
  const avgSleep     = logs.length
    ? (logs.reduce((a, b) => a + (b.sleep_hours ?? 0), 0) / logs.filter(l => l.sleep_hours).length).toFixed(1)
    : "—";
  const latestWeight = logs.find(l => l.weight)?.weight ?? "—";

  const tooltipStyle = {
    contentStyle: { background: "#1a1a2e", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 10, color: "#e8d5b0", fontSize: 12 },
  };

  return (
    <div className="space-y-5">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "최근 체중", value: latestWeight !== "—" ? `${latestWeight}kg` : "—", color: "text-coral" },
          { label: "평균 수면", value: avgSleep !== "—" ? `${avgSleep}h` : "—",          color: "text-teal" },
          { label: "운동 일수", value: `${exerciseDays}일`,                               color: "text-gold" },
        ].map((s, i) => (
          <div key={i} className="bg-navy-800 rounded-xl p-3 border border-navy-500 text-center">
            <div className={`font-black text-lg font-mono ${s.color}`}>{s.value}</div>
            <div className="text-navy-100 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today input */}
      <div className="bg-navy-800 rounded-xl p-4 border border-navy-500">
        <div className="text-gold-light font-bold text-sm mb-4">
          오늘 기록 ({format(new Date(), "M월 d일 (EEE)", { locale: ko })})
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-navy-100 text-xs mb-1 block">체중 (kg)</label>
            <input className="input" type="number" step="0.1" placeholder="예: 72.5"
              value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div>
            <label className="text-navy-100 text-xs mb-1 block">수면 시간 (h)</label>
            <input className="input" type="number" step="0.5" placeholder="예: 7.5"
              value={sleep} onChange={e => setSleep(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-navy-100 text-xs mb-1 block">메모</label>
          <input className="input" placeholder="오늘 컨디션은?" value={memo}
            onChange={e => setMemo(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setExercise(!exercise)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${exercise ? "bg-teal/15 border-teal/40 text-teal" : "bg-navy-700 border-navy-400 text-navy-100"}`}>
            <span>{exercise ? "✅" : "⬜"}</span> 운동 완료
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            {saved ? "저장됨 ✓" : "저장"}
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div>
          <div className="text-navy-100 text-xs mb-2">체중 & 수면 추이 (최근 14일)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" tick={{ fill: "#7a7a9a", fontSize: 10 }} />
              <YAxis yAxisId="w" tick={{ fill: "#7a7a9a", fontSize: 10 }} width={35} domain={["auto","auto"]} />
              <YAxis yAxisId="s" orientation="right" tick={{ fill: "#7a7a9a", fontSize: 10 }} width={30} />
              <Tooltip {...tooltipStyle} />
              <Line yAxisId="w" type="monotone" dataKey="weight" stroke="#E07B6A" strokeWidth={2} dot={{ r: 3, fill: "#E07B6A" }} name="체중(kg)" />
              <Line yAxisId="s" type="monotone" dataKey="sleep"  stroke="#4A9B8E" strokeWidth={2} dot={{ r: 3, fill: "#4A9B8E" }} name="수면(h)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
