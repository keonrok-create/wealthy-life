"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-banner-dismissed")) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) { setIsIOS(true); setShowBanner(true); return; }

    // Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  }

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-[300]
                    bg-navy-700 border border-gold/30 rounded-2xl p-4 shadow-2xl
                    animate-[slideUp_0.3s_ease]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-xl shrink-0">📱</div>
        <div className="flex-1 min-w-0">
          <div className="text-gold-light font-bold text-sm mb-0.5">홈 화면에 추가하기</div>
          {isIOS ? (
            <p className="text-navy-100 text-xs leading-relaxed">
              Safari 하단의 <strong className="text-gold">공유 버튼</strong>을 탭한 후<br />
              <strong className="text-gold">"홈 화면에 추가"</strong>를 선택하세요
            </p>
          ) : (
            <p className="text-navy-100 text-xs">앱처럼 사용할 수 있어요</p>
          )}
        </div>
        <button onClick={dismiss} className="text-navy-300 hover:text-navy-100 text-xl leading-none shrink-0">×</button>
      </div>

      {!isIOS && deferredPrompt && (
        <div className="flex gap-2 mt-3">
          <button onClick={dismiss}  className="btn-ghost flex-1 text-xs py-2">나중에</button>
          <button onClick={install}  className="btn-primary flex-1 text-xs py-2">설치하기</button>
        </div>
      )}
    </div>
  );
}
