import React, { useMemo, useState } from "react";

function ToggleIconButton({ icon, onClick, hidden }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface ${hidden ? "hidden" : ""}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

export default function AuthPage({ mode, onLogin, onRegister, onNavigate }) {
  const isLogin = mode === "login";
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const title = isLogin ? "Welcome back" : "Join the swarm";
  const subtitle = isLogin ? "Log in to your technical intelligence dashboard." : "Start scaling your developer outreach with AI.";
  const submitLabel = isLogin ? "Sign In" : "Create Account";
  const toggleLabel = isLogin ? "Sign up" : "Log in";
  const toggleText = isLogin ? "Don't have an account?" : "Already have an account?";

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (!isLogin && (!fullName || !confirmPassword)) return false;
    return true;
  }, [email, password, fullName, confirmPassword, isLogin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (!isLogin && password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName);
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 technical-grid" />
        <div className="absolute top-0 left-[15%] data-stream" style={{ animationDelay: "0s" }} />
        <div className="absolute top-0 left-[45%] data-stream" style={{ animationDelay: "2s" }} />
        <div className="absolute top-0 left-[85%] data-stream" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="glass-auth-card w-full max-w-[440px] rounded-xl p-8 transition-all duration-500 md:p-10" id="auth-card">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  radar
                </span>
              </div>
              <span className="font-display text-headline-md font-bold tracking-tight text-on-surface">Scouter AI</span>
            </div>
            <h1 className="mb-2 font-headline-lg-mobile text-on-surface md:font-headline-lg" id="auth-title">
              {title}
            </h1>
            <p className="font-body-md text-on-surface-variant" id="auth-subtitle">
              {subtitle}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-3 font-label-md text-on-surface transition-colors hover:bg-surface-container" type="button">
              <img alt="Google" className="h-5 w-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsgegQreSOTkRz1TFAy1BrePj25JF4QGdKzm9HqjHRZP7pyz3m7-w5DEK7MpTp7mOM6PuwHC7Tevtmvcj3hkBQkt2S2upx5ha9Kdj6_ersfgPz-LYISKXlFvGrytmIMXCXbh6l6Y5roshUu5jbqplkf-Q0v9OL0mpMyKkzMuLm9_X7wZPBJxSy-huuiPAt-reqHg1pGPDg-bFItnz7s44qhMPuLfmwgO2FX4N_p214jygywkivBwGAa4Dpqo-Jo3IwYsG1qgYLFPg" />
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-3 font-label-md text-on-surface transition-colors hover:bg-surface-container" type="button">
              <img alt="GitHub" className="h-5 w-5 invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3wdg-6UI11_5YB8WT8AqWB3FpyQO22qdiyDzZZ7nep3GYkouAUXUAvMGrVa2_te5ONwmvEAuJHUv5lk6NgLZbOByKow9P3riq4i2iAsMOS79cBEDPevL_Ajf3BJqdYBB6-zwQhvD10XXUvzcmUkJnVFzj30QkBQPgX5aqdvHteofnfNEVZXnMOmRqSavR-IioMSDoi6_F-kYBd97zYkZf9qrv9TWHjMY_JOQ0mSqOJqkUK3hFEkr_s-PNVU9FbBeIsddm7R1p6h8" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative mb-8 flex items-center">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="mx-4 flex-shrink text-on-surface-variant font-label-sm uppercase tracking-widest">or continue with email</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-1 block text-on-surface-variant font-label-md">Full Name</label>
                  <input
                    autoComplete="name"
                    className="input-technical h-12 w-full rounded-lg px-4 font-label-md text-on-surface placeholder:text-outline"
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="ml-1 block font-label-md text-on-surface-variant">Work Email</label>
              <input
                autoComplete="email"
                autoFocus
                className="input-technical h-12 w-full rounded-lg px-4 font-label-md text-on-surface placeholder:text-outline"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="block font-label-md text-on-surface-variant">Password</label>
                <button
                  className={`font-label-sm text-primary transition-colors hover:text-primary-fixed ${isLogin ? "" : "hidden"}`}
                  id="forgot-password"
                  type="button"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="input-technical h-12 w-full rounded-lg px-4 font-label-md text-on-surface placeholder:text-outline"
                  id="password-input"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ToggleIconButton icon={showPassword ? "visibility_off" : "visibility"} onClick={() => setShowPassword((value) => !value)} />
              </div>
            </div>

            {!isLogin ? (
              <div className="space-y-2">
                <label className="ml-1 block font-label-md text-on-surface-variant">Confirm Password</label>
                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="input-technical h-12 w-full rounded-lg px-4 font-label-md text-on-surface placeholder:text-outline"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <ToggleIconButton hidden onClick={() => setShowPassword((value) => !value)} icon="visibility" />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <button
              className="btn-primary-glow flex h-12 w-full items-center justify-center gap-2 rounded-lg font-label-md font-bold text-on-primary-container transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy || !canSubmit}
              id="submit-btn"
              type="submit"
            >
              <span id="submit-text">{busy ? (isLogin ? "Signing In…" : "Creating Account…") : submitLabel}</span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="font-body-md text-on-surface-variant">
              <span id="toggle-text">{toggleText}</span>
              <button
                className="ml-1 font-bold text-primary hover:underline"
                id="toggle-auth"
                type="button"
                onClick={() => onNavigate(isLogin ? "/register" : "/login")}
              >
                {toggleLabel}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 font-label-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <span>System Operational</span>
          </div>
          <span className="opacity-20">|</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">encrypted</span>
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </main>
    </div>
  );
}