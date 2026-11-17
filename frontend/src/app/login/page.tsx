"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useAuth } from "@clerk/nextjs";
import api from "@/lib/api";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn]);

  const enterDemoMode = (userEmail = "demo@meetmind.com") => {
    document.cookie = "demo_session=true; path=/; max-age=86400; SameSite=Lax";
    localStorage.setItem("token", "demo_token");
    localStorage.setItem("user_email", userEmail);
    window.location.href = "/dashboard";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const targetEmail = email.trim() || "demo@meetmind.com";

    // If it's explicitly demo account, enter demo mode instantly
    if (
      targetEmail.toLowerCase() === "demo@meetmind.com" ||
      targetEmail.toLowerCase().includes("demo")
    ) {
      enterDemoMode(targetEmail);
      return;
    }

    // Try backend authentication, but gracefully fallback to demo workspace if backend is offline
    try {
      const res = await api.post("/auth/login", { email: targetEmail, password });
      if (res.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_email", targetEmail);
        window.location.href = "/dashboard";
        return;
      }
      enterDemoMode(targetEmail);
    } catch (backendErr) {
      console.warn("Backend offline, entering demo session:", backendErr);
      // Auto-fallback: HR or user is NEVER blocked by a dead backend
      enterDemoMode(targetEmail);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    openSignIn({
      forceRedirectUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="#1e40af"
            />
            <path
              d="M19 16L19.75 19L23 19.75L19.75 20.5L19 23L18.25 20.5L15 19.75L18.25 19L19 16Z"
              fill="#3b82f6"
            />
          </svg>
          <h1 className="text-2xl font-bold text-slate-900">MeetMind</h1>
        </div>
        <p className="text-slate-500 text-sm text-center">
          Turn your meetings into actionable insights
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* Quick Demo Access Callout for HR */}
        <div className="mb-6 p-3.5 bg-blue-50/80 border border-blue-200/70 rounded-xl">
          <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>PORTFOLIO REVIEWER / HR DEMO</span>
          </div>
          <p className="text-xs text-blue-700/90 mb-3 leading-relaxed">
            Ingin mencoba fitur AI secara langsung? Klik tombol di bawah untuk masuk ke akun demo instan.
          </p>
          <button
            type="button"
            onClick={() => enterDemoMode("demo@meetmind.com")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Login (demo@meetmind.com)</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3.5 py-2.5 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="name@company.com atau demo@meetmind.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="•••••••• (demo: demo123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <span>Login</span>
                <span>→</span>
              </>
            )}
          </button>

          <div className="relative flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600 font-semibold hover:underline"
        >
          Register
        </Link>
      </p>

      <div className="mt-8 text-xs text-slate-400 text-center">
        <span>© 2024 MEETMIND AI. DISTILLING CHAOS INTO CLARITY.</span>
      </div>
    </div>
  );
}
