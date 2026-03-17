"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { CategoryStats, MonthlyStats } from "@/lib/types";

const COLORS = ["#C8A96E","#4A9B8E","#E07B6A","#7B9EC8","#A87BC8","#6AC87B","#E0A86A","#6A8AE0"];

const tooltipStyle = {
  contentStyle: { background: "#1a1a2e", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 10, color: "#e8d5b0", fontSize: 12 },
  formatter: (v: number) => [`${v.toLocaleString()}원`],
};

// Monthly trend chart
export function MonthlyChart({ data }: { data: MonthlyStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4A9B8E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4A9B8E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#E07B6A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#E07B6A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis dataKey="month" tick={{ fill: "#7a7a9a", fontSize: 11 }} />
        <YAxis tick={{ fill: "#7a7a9a", fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} width={40} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: "#7a7a9a", fontSize: 12 }} />
        <Area type="monotone" dataKey="income"  stroke="#4A9B8E" fill="url(#incG)" strokeWidth={2} name="수입" />
        <Area type="monotone" dataKey="expense" stroke="#E07B6A" fill="url(#expG)" strokeWidth={2} name="지출" />
        <Area type="monotone" dataKey="save"    stroke="#C8A96E" fill="none"        strokeWidth={2} name="저축" strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Category breakdown pie chart
export function CategoryPieChart({ data }: { data: CategoryStats[] }) {
  if (data.length === 0) return <div className="flex items-center justify-center h-40 text-navy-100 text-sm">지출 데이터가 없어요</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend
          layout="vertical" align="right" verticalAlign="middle"
          wrapperStyle={{ color: "#7a7a9a", fontSize: 11 }}
          formatter={(val, entry: any) => (
            <span style={{ color: "#c8c8e8" }}>{val} ({((entry.payload.value / data.reduce((a,b)=>a+b.value,0))*100).toFixed(0)}%)</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Savings bar chart
export function SavingsBarChart({ data }: { data: MonthlyStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={20} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis dataKey="month" tick={{ fill: "#7a7a9a", fontSize: 11 }} />
        <YAxis tick={{ fill: "#7a7a9a", fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} width={40} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="save" fill="#C8A96E" radius={[4,4,0,0]} name="저축액" />
      </BarChart>
    </ResponsiveContainer>
  );
}
