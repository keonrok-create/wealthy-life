"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setError("이메일을 확인해 인증 링크를 클릭해주세요!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("이메일 또는 비밀번호가 올바르지 않습니다."); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-gold text-4xl font-black tracking-tight">WEALTHY</div>
          <div className="text-navy-100 text-xs tracking-[0.3em] mt-1">LIFE & FINANCE</div>
        </div>

        <div className="card">
          <h2 className="text-gold-light font-bold text-lg mb-6">
            {isSignUp ? "회원가입" : "로그인"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-navy-100 text-xs mb-1.5 block">이름</label>
                <input className="input" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-navy-100 text-xs mb-1.5 block">이메일</label>
              <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-navy-100 text-xs mb-1.5 block">비밀번호</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <p className={`text-sm ${error.includes("확인") ? "text-teal" : "text-coral"}`}>{error}</p>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "처리 중..." : isSignUp ? "가입하기" : "로그인"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-400" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-navy-700 px-3 text-navy-100 text-xs">또는</span>
            </div>
          </div>

          <button onClick={handleGoogle} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google로 계속하기
          </button>

          <p className="text-center text-navy-100 text-sm mt-6">
            {isSignUp ? "이미 계정이 있나요?" : "계정이 없으신가요?"}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-gold ml-2 font-bold hover:text-gold-light transition-colors">
              {isSignUp ? "로그인" : "회원가입"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
