"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        supabase.from("profiles").select("name").eq("id", data.user.id).single()
          .then(({ data: p }) => { if (p) setName(p.name); });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ name }).eq("id", user.id);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div>
      <PageHeader title="설정" subtitle="계정 및 앱 설정" />
      <div className="max-w-lg space-y-5">
        {/* Profile */}
        <Card>
          <SectionTitle icon="👤" title="프로필" />
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-navy-100 text-xs mb-1.5 block">이름</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="이름을 입력하세요" />
            </div>
            <div>
              <label className="text-navy-100 text-xs mb-1.5 block">이메일</label>
              <input className="input opacity-60 cursor-not-allowed" value={email} disabled />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saved ? "저장됨 ✓" : saving ? "저장 중..." : "저장하기"}
            </button>
          </form>
        </Card>

        {/* PWA */}
        <Card>
          <SectionTitle icon="📱" title="앱 설치 (PWA)" />
          <p className="text-navy-100 text-sm leading-relaxed mb-4">
            Wealthy를 홈 화면에 추가하면 앱처럼 빠르게 실행할 수 있어요.<br />
            오프라인에서도 일부 기능을 사용할 수 있습니다.
          </p>
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-500 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🍎</span>
              <div>
                <div className="text-gold-light text-sm font-bold mb-1">iOS (Safari)</div>
                <div className="text-navy-100 text-xs leading-relaxed">
                  하단 공유 버튼(□↑) 탭 → <strong className="text-gold">"홈 화면에 추가"</strong> 선택
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-gold-light text-sm font-bold mb-1">Android (Chrome)</div>
                <div className="text-navy-100 text-xs leading-relaxed">
                  주소창 우측 메뉴(⋮) 탭 → <strong className="text-gold">"홈 화면에 추가"</strong> 선택<br />
                  또는 하단에 표시되는 설치 배너를 이용하세요
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card>
          <SectionTitle icon="⚠️" title="계정 관리" />
          <button onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-coral/30 text-coral text-sm font-bold
                       hover:bg-coral/10 transition-all">
            로그아웃
          </button>
        </Card>
      </div>
    </div>
  );
}
