"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // PWA install
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) { setIsInstalled(true); return; }
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;
    setIsIOS(ios);
    setIsMobile(mobile);
    const handler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPromptRef.current) {
      await installPromptRef.current.prompt();
      const { outcome } = await installPromptRef.current.userChoice;
      if (outcome === "accepted") { setIsInstalled(true); installPromptRef.current = null; setCanInstall(false); }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) toast.error("Invalid email or password.");
      else { router.push("/portal"); router.refresh(); }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const showBanner = !isInstalled && !dismissed && (canInstall || isIOS || isMobile);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-raised)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    padding: "14px 16px",
    fontSize: "16px",
    outline: "none",
  };

  return (
    <>
      {/* PWA install banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
          <Image src="/icon-72x72.png" alt="icon" width={40} height={40} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Maken Client Portal</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isIOS ? "Add to home screen for quick access" : "Install for faster access"}
            </p>
          </div>
          <button onClick={handleInstall}
            className="shrink-0 px-4 py-2 text-sm font-bold"
            style={{ background: "var(--gold)", color: "var(--accent-fg)" }}>
            Install
          </button>
          <button onClick={() => setDismissed(true)} style={{ color: "var(--text-muted)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* iOS guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm mx-auto p-6 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Add to Home Screen</h3>
              <button onClick={() => setShowIOSGuide(false)} style={{ color: "var(--text-muted)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {(isIOS
              ? [
                  { n: "1", t: "Tap the Share button (□↑) in Safari's toolbar" },
                  { n: "2", t: 'Scroll down and tap "Add to Home Screen"' },
                  { n: "3", t: 'Tap "Add" to confirm' },
                ]
              : [
                  { n: "1", t: "Tap the 3-dot menu (⋮) in your browser" },
                  { n: "2", t: 'Tap "Add to Home screen" or "Install app"' },
                  { n: "3", t: 'Tap "Add" or "Install" to confirm' },
                ]
            ).map(({ n, t }) => (
              <div key={n} className="flex gap-3 items-start">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center text-xs font-black" style={{ background: "var(--gold)", color: "var(--accent-fg)" }}>{n}</span>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t}</p>
              </div>
            ))}
            <button onClick={() => setShowIOSGuide(false)} className="w-full py-3 text-sm font-bold" style={{ background: "var(--gold)", color: "var(--accent-fg)" }}>Got it</button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex" style={{ background: "var(--bg-page)" }}>
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-[45%] flex-col p-14 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(to right, var(--text-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: "var(--gold)" }} />

          <div className="relative">
            <div className="flex items-center gap-4 mb-16">
              <Image src="/icon-192x192.png" alt="Logo" width={72} height={72} className="shrink-0" />
              <div>
                <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Maken International</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Client Portal</p>
              </div>
            </div>

            <div className="mb-10">
              <p className="text-xs tracking-[0.3em] uppercase mb-4 font-mono" style={{ color: "var(--gold)" }}>Your Visa Journey</p>
              <h1 className="text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
                TRACK YOUR<br />APPLICATION.
              </h1>
              <p className="text-base mt-5 leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
                View your visa process status, download your documents, and monitor your payment history — all in one place.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: "📋", text: "Application status & progress" },
                { icon: "📄", text: "View & download all documents" },
                { icon: "💳", text: "Payment history & balance" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-lg">{icon}</span>
                  <span className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-auto pt-8">
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>MAKEN INTERNATIONAL — CLIENT PORTAL</p>
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <Image src="/icon-192x192.png" alt="Logo" width={52} height={52} className="shrink-0" />
              <div>
                <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Maken International</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Client Portal</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-8 h-0.5 mb-5" style={{ background: "var(--gold)" }} />
              <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
              <p className="text-base mt-2" style={{ color: "var(--text-secondary)" }}>
                Sign in with the email and password provided by your agent.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }} tabIndex={-1}>
                    {showPass
                      ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="square" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="square" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="square" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 text-base font-bold transition-opacity disabled:opacity-50"
                style={{ background: "var(--gold)", color: "var(--accent-fg)" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Install Now button — always visible on mobile, hidden once installed or dismissed */}
            {!isInstalled && !dismissed && isMobile && (
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs text-center mb-3 font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Get the app
                </p>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
                  style={{ background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isIOS ? "Add to Home Screen" : "Install Now"}
                </button>
              </div>
            )}

            <p className="text-sm text-center mt-8" style={{ color: "var(--text-muted)" }}>
              Contact your agent if you need help logging in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
