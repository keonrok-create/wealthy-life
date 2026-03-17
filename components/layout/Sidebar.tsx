"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard",   icon: "🌱", label: "자기계발" },
  { href: "/finance",     icon: "💹", label: "재테크" },
  { href: "/statements",  icon: "📊", label: "재무제표" },
  { href: "/report",      icon: "🩺", label: "가계경영진단" },
  { href: "/community",   icon: "🤝", label: "커뮤니티" },
];

type Props = { userName?: string; netWorth?: number };

export default function Sidebar({ userName = "사용자", netWorth = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 w-[220px] h-screen
                        bg-gradient-to-b from-navy-800 to-navy-900
                        border-r border-navy-500 z-50">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <div className="text-gold font-black text-2xl tracking-tight">WEALTHY</div>
          <div className="text-navy-300 text-[10px] tracking-[0.3em] mt-1">LIFE & FINANCE</div>
        </div>

        {/* Profile */}
        <div className="px-4 pb-5 border-b border-navy-500">
          <div className="bg-navy-700 rounded-xl p-3 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-coral
                           flex items-center justify-center text-xl shrink-0">🦅</div>
            <div className="min-w-0">
              <div className="text-gold-light font-bold text-sm truncate">{userName}</div>
              <div className="text-gold text-xs">순자산 {(netWorth / 10000).toLocaleString()}만원</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname.startsWith(item.href)
                  ? "bg-gold/10 border border-gold/30 text-gold font-bold"
                  : "text-navy-200 hover:text-gold-light hover:bg-navy-700"
              )}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-navy-500 space-y-2">
          <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-xl text-navy-100 text-xs hover:text-gold-light hover:bg-navy-700 transition-all">
            ⚙️ 설정
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-navy-100 text-xs hover:text-coral hover:bg-navy-700 transition-all text-left">
            🚪 로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-navy-800/95 backdrop-blur border-t border-navy-500
                      flex safe-bottom">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all",
              pathname.startsWith(item.href) ? "text-gold" : "text-navy-200"
            )}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
