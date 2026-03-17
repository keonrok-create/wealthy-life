import clsx from "clsx";

// ── Card ──────────────────────────────────────
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("card", className)}>{children}</div>
  );
}

// ── KPI Card ─────────────────────────────────
type KpiProps = { icon: string; label: string; value: string; color?: string; sub?: string };
export function KpiCard({ icon, label, value, color = "text-gold", sub }: KpiProps) {
  return (
    <Card>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={clsx("font-black text-2xl font-mono", color)}>{value}</div>
      <div className="text-navy-100 text-xs mt-1">{label}</div>
      {sub && <div className="text-navy-200 text-[10px] mt-0.5">{sub}</div>}
    </Card>
  );
}

// ── Section Title ─────────────────────────────
export function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="section-title">
      <span>{icon}</span>
      <h2>{title}</h2>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────
export function ProgressBar({ value, max, color = "#C8A96E", height = 8 }: {
  value: number; max: number; color?: string; height?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="bg-navy-800 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── Badge ─────────────────────────────────────
export function Badge({ text, color = "#C8A96E" }: { text: string; color?: string }) {
  return (
    <span className="badge text-[11px]"
      style={{ color, borderColor: `${color}44`, background: `${color}18` }}>
      {text}
    </span>
  );
}

// ── Empty State ───────────────────────────────
export function EmptyState({ icon, message, action }: { icon: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-navy-100">
      <span className="text-5xl">{icon}</span>
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gold-light font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-navy-100 hover:text-coral text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Loading Spinner ───────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-navy-400 border-t-gold animate-spin" />
    </div>
  );
}

// ── Page Header ───────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-gold-light font-extrabold text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-navy-100 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
