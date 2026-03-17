"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setMessage("오류: " + error.message);
      } else {
        setMessage("가입 완료! 이메일을 확인해주세요.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage("로그인 실패: " + error.message);
      } else if (data.session) {
        setMessage("로그인 성공! 이동 중...");
        window.location.replace("https://wealthy-life.vercel.app/dashboard");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      fontFamily: "sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ color: "#C8A96E", fontSize: "32px", fontWeight: 900 }}>WEALTHY</div>
          <div style={{ color: "#5a5a7a", fontSize: "11px", letterSpacing: "3px" }}>LIFE & FINANCE</div>
        </div>

        <div style={{
          background: "#16162a",
          border: "1px solid rgba(200,169,110,0.15)",
          borderRadius: "16px",
          padding: "28px",
        }}>
          <h2 style={{ color: "#e8d5b0", marginBottom: "24px", fontSize: "18px" }}>
            {isSignUp ? "회원가입" : "로그인"}
          </h2>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "#7a7a9a", fontSize: "12px", display: "block", marginBottom: "6px" }}>이름</label>
                <input
                  style={{ width: "100%", background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: "10px", padding: "10px 14px", color: "#e8d5b0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  placeholder="이름"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#7a7a9a", fontSize: "12px", display: "block", marginBottom: "6px" }}>이메일</label>
              <input
                type="email"
                style={{ width: "100%", background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: "10px", padding: "10px 14px", color: "#e8d5b0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#7a7a9a", fontSize: "12px", display: "block", marginBottom: "6px" }}>비밀번호</label>
              <input
                type="password"
                style={{ width: "100%", background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: "10px", padding: "10px 14px", color: "#e8d5b0", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {message && (
              <div style={{ color: message.includes("성공") || message.includes("완료") ? "#4A9B8E" : "#E07B6A", fontSize: "13px", marginBottom: "16px" }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: "#C8A96E", color: "#0d0d1a", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 800, fontSize: "15px", cursor: "pointer" }}
            >
              {loading ? "처리 중..." : isSignUp ? "가입하기" : "로그인"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#7a7a9a", fontSize: "13px", marginTop: "20px" }}>
            {isSignUp ? "이미 계정이 있나요?" : "계정이 없으신가요?"}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
              style={{ background: "none", border: "none", color: "#C8A96E", fontWeight: 700, cursor: "pointer", marginLeft: "6px" }}
            >
              {isSignUp ? "로그인" : "회원가입"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
