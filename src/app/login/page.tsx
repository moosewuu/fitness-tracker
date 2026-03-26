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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💪</div>
          <h1 className="text-2xl font-extrabold text-white">Fitness Tracker</h1>
          <p className="text-sm text-zinc-500 mt-1">Track your gains. Stay consistent.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141414] rounded-2xl p-6 border border-zinc-800">
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1c1c1c] border border-zinc-700 rounded-lg text-white text-sm px-3 py-2.5 outline-none focus:border-purple-500 transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#1c1c1c] border border-zinc-700 rounded-lg text-white text-sm px-3 py-2.5 outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg py-2.5 transition-colors"
          >
            {loading ? "..." : isSignUp ? "Sign Up" : "Log In"}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="w-full mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
