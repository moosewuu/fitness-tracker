"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      setError("Check your email for a confirmation link.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #22D3EE, transparent)" }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-violet" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white text-glow-violet">THE PERFORMANCE LAB</h1>
          <p className="font-body text-xs text-white/30 mt-2 uppercase tracking-[0.2em]">Athlete Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6">
          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-2 font-body">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="hud-input text-left"
              placeholder="you@email.com"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-2 font-body">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="hud-input text-left"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40 glow-violet-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
          >
            {loading ? "..." : isSignUp ? "CREATE ACCOUNT" : "INITIATE SESSION"}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="w-full mt-3 text-xs text-white/30 hover:text-white/50 transition-colors font-body"
          >
            {isSignUp ? "Already registered? Log in" : "New operator? Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
