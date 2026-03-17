"use client";
import { useMemo } from "react";
import { useAssets, useLiabilities } from "@/lib/hooks/useStatements";
import { useTransactions } from "@/lib/hooks/useFinance";
import { Card, SectionTitle, PageHeader, Badge, ProgressBar, Spinner } from "@/components/ui";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#4A9B8E" : score >= 60 ? "#C8A96E" : "#E07B6A";
  const label = score >= 80 ? "우수 🟢" : score >= 60 ? "양호 🟡" : "개선필요 🔴";
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e2e" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} 100`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.5s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-black text-4xl font-mono" style={{ color }}>{score}</div>
          <div className="text-navy-100 text-xs">/ 100</div>
        </div>
      </div>
      <Badge text={label} color={color} />
      <div className="text-navy-100 text-xs mt-3 text-center leading-relaxed">종합 재무건강 점수</div>
    </div>
  );
}

export default function ReportClient() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const { assets,      loading: aLoading } = useAssets();
  const { liabilities, loading: lLoading } = useLiabilities();
  const { transactions, loading: tLoading } = useTransactions(currentMonth);

  const totalAssets      = assets.reduce((a, b) => a + b.amount, 0);
  const totalLiabilities = liabilities.reduce((a, b) => a + b.amount, 0);
  const equity           = totalAssets - totalLiabilities;
  const income   = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense  = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const saveAmt  = income - expense;
  const saveRate = income > 0 ? (saveAmt / income) * 100 : 0;
  const debtRatio= totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Category breakdown
  const categoryMap = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [transactions]);

  // Score calculations
  const scores = useMemo(() => {
    const incomeStability = Math.min(100, income > 0 ? 85 : 0);  // simplified
    const expenseControl  = Math.min(100, saveRate >= 30 ? 80 : saveRate >= 20 ? 65 : 45);
    const savingsHealth   = Math.min(100, saveRate >= 40 ? 90 : saveRate >= 30 ? 75 : saveRate >= 20 ? 60 : 40);
    const debtMgmt        = Math.min(100, debtRatio <= 10 ? 95 : debtRatio <= 30 ? 80 : debtRatio <= 50 ? 60 : 40);
    const investment      = Math.min(100, assets.filter(a => a.category === "투자자산").length > 0 ? 70 : 30);
    const emergency       = useMemo(() => {
      const liquid  = assets.filter(a => a.category === "유동자산").reduce((a, b) => a + b.amount, 0);
      const months  = expense > 0 ? liquid / expense : 0;
      return Math.min(100, months >= 6 ? 90 : months >= 3 ? 70 : months >= 1 ? 50 : 30);
    }, [assets, expense]);

    return [
      { label: "수입 안정성",   score: incomeStability, comment: income > 0 ? "안정적 소득 확인" : "수입 데이터 없음",         color: "#4A9B8E" },
      { label: "지출 통제력",   score: expenseControl,  comment: saveRate >= 30 ? "지출 관리 양호" : "지출 절감 여지 있음",     color: "#C8A96E" },
      { label: "저축 건전성",   score: savingsHealth,   comment: `저축률 ${saveRate.toFixed(1)}%`,                           color: "#7B9EC8" },
      { label: "부채 관리",     score: debtMgmt,        comment: `부채비율 ${debtRatio.toFixed(1)}%`,                        color: "#4A9B8E" },
      { label: "투자 다각화",   score: investment,      comment: assets.filter(a=>a.category==="투자자산").length > 1 ? "다양한 투자자산 보유" : "투자 다각화 필요", color: "#A87BC8" },
      { label: "비상금 준비",   score: emergency,       comment: expense > 0 ? `월지출 대비 ${((assets.filter(a=>a.category==="유동자산").reduce((a,b)=>a+b.amount,0))/Math.max(expense,1)).toFixed(1)}개월` : "데이터 부족", color: "#E07B6A" },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, liabilities, income, expense, saveRate, debtRatio]);

  const avgScore = Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length);

  const radarData = scores.map(s => ({ subject: s.label, score: s.score, fullMark: 100 }));

  // Recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    const liquidAssets = assets.filter(a => a.category === "유동자산").reduce((a, b) => a + b.amount, 0);
    const emergencyTarget = expense * 6;

    if (liquidAssets < emergencyTarget)
      recs.push({ priority: "🔴 긴급", title: "비상금 확충", desc: `목표 비상금 ${(emergencyTarget/10000).toFixed(0)}만원 대비 ${(liquidAssets/10000).toFixed(0)}만원 보유 중`, action: `매달 ${((emergencyTarget-liquidAssets)/12/10000).toFixed(0)}만원 추가 적립` });

    if (saveRate < 30)
      recs.push({ priority: "🔴 긴급", title: "저축률 개선", desc: `현재 저축률 ${saveRate.toFixed(1)}% — 최소 30% 목표를 권장합니다`, action: "변동지출 10% 절감 목표" });

    if (debtRatio > 30)
      recs.push({ priority: "🟡 권장", title: "부채 감축", desc: `부채비율 ${debtRatio.toFixed(1)}% — 30% 이하로 낮추세요`, action: "고금리 부채부터 상환" });

    if (assets.filter(a => a.category === "투자자산").length < 2)
      recs.push({ priority: "🟡 권장", title: "투자 다각화", desc: "투자자산이 단일 종목에 집중되어 있습니다", action: "ETF/채권으로 분산 투자" });

    if (saveRate >= 30 && saveRate < 40)
      recs.push({ priority: "🟢 유지", title: "저축 습관 유지", desc: `저축률 ${saveRate.toFixed(1)}% 양호 — 자동이체 유지`, action: "자동이체 설정 유지" });

    recs.push({ priority: "🔵 장기", title: "IRP/ISA 활용", desc: "세제혜택 계좌를 통한 절세 전략을 검토하세요", action: "연 900만원 IRP 납입 검토" });

    return recs.slice(0, 6);
  }, [assets, saveRate, debtRatio, expense]);

  const loading = aLoading || lLoading || tLoading;

  return (
    <div>
      <PageHeader title="가계경영 진단 리포트" subtitle={`${format(new Date(), "yyyy년 M월")} 기준 종합 재무건강 분석`} />

      {loading ? <Spinner /> : (
        <div className="space-y-5">
          {/* Score + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <ScoreGauge score={avgScore} />
              {/* Net worth highlight */}
              <div className="mt-2 grid grid-cols-3 gap-2 border-t border-navy-500 pt-4">
                {[
                  { label: "순자산",  value: `${(equity/10000).toLocaleString()}만`, color: "text-gold" },
                  { label: "저축률",  value: `${saveRate.toFixed(1)}%`,               color: saveRate >= 30 ? "text-teal" : "text-coral" },
                  { label: "부채비율", value: `${debtRatio.toFixed(1)}%`,             color: debtRatio <= 30 ? "text-teal" : "text-coral" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className={`font-black font-mono text-lg ${s.color}`}>{s.value}</div>
                    <div className="text-navy-100 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle icon="🕸" title="재무건강 레이더" />
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#2a2a3e" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#7a7a9a", fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#C8A96E" fill="#C8A96E" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 10, color: "#e8d5b0", fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Score details */}
          <Card>
            <SectionTitle icon="🔍" title="항목별 세부 진단" />
            <div className="space-y-4">
              {scores.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gold-light text-sm font-bold">{s.label}</span>
                      <span className="text-navy-100 text-xs hidden sm:inline">{s.comment}</span>
                    </div>
                    <span className="font-black font-mono text-sm" style={{ color: s.color }}>{s.score}</span>
                  </div>
                  <ProgressBar value={s.score} max={100} color={s.color} height={7} />
                  <div className="text-navy-200 text-xs mt-1 sm:hidden">{s.comment}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card>
            <SectionTitle icon="📌" title="맞춤 개선 권고사항" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((r, i) => (
                <div key={i} className="bg-navy-800 rounded-xl p-4 border border-navy-500 space-y-2">
                  <div className="text-xs text-navy-200 font-bold">{r.priority}</div>
                  <div className="text-gold-light font-bold text-sm">{r.title}</div>
                  <div className="text-navy-100 text-xs leading-relaxed">{r.desc}</div>
                  <Badge text={r.action} color="#C8A96E" />
                </div>
              ))}
            </div>
          </Card>

          {/* Summary table */}
          <Card>
            <SectionTitle icon="📊" title="재무 요약 지표" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-500">
                    <th className="text-left py-2 px-3 text-navy-100 font-medium text-xs">지표</th>
                    <th className="text-right py-2 px-3 text-navy-100 font-medium text-xs">현재</th>
                    <th className="text-right py-2 px-3 text-navy-100 font-medium text-xs">목표</th>
                    <th className="text-right py-2 px-3 text-navy-100 font-medium text-xs">평가</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-500">
                  {[
                    { label: "저축률",   current: `${saveRate.toFixed(1)}%`,     target: "30% 이상",  ok: saveRate >= 30 },
                    { label: "부채비율", current: `${debtRatio.toFixed(1)}%`,    target: "30% 이하",  ok: debtRatio <= 30 },
                    { label: "순자산",   current: `${(equity/10000).toFixed(0)}만원`, target: "꾸준히 증가", ok: equity > 0 },
                    { label: "월 저축액", current: `${(saveAmt/10000).toFixed(0)}만원`, target: "수입의 30%", ok: saveRate >= 30 },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 text-gold-light">{row.label}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gold-light">{row.current}</td>
                      <td className="py-2.5 px-3 text-right text-navy-100 text-xs">{row.target}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge text={row.ok ? "✓ 달성" : "△ 미달"} color={row.ok ? "#4A9B8E" : "#E07B6A"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
