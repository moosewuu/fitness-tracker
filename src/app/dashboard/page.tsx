"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { PROGRAM, TABS, getE1RM, todayISO, type SetLog, type HistoryEntry, type TabName } from "@/lib/program";
import TodayView from "@/components/TodayView";
import ProgressView from "@/components/ProgressView";
import MacrosView from "@/components/MacrosView";
import CoachView from "@/components/CoachView";

interface MacroEntry { protein: number; carbs: number; fat: number; calories: number }
interface BodyEntry { date: string; weight: number | null; waist: number | null }
interface CoachMessage { role: "user" | "assistant"; content: string }

const TAB_ICONS: Record<TabName, string> = { Today: "⚡", Progress: "📊", Macros: "🧬", Coach: "🤖" };
const TAB_LABELS: Record<TabName, string> = { Today: "OUTPUT", Progress: "VITALS", Macros: "FUEL", Coach: "INTEL" };

export default function DashboardPage() {
  const [tab, setTab] = useState<TabName>("Today");
  const [activeDay, setActiveDay] = useState(0);
  const [sessionLog, setSessionLog] = useState<Record<string, { sets: SetLog[] }>>({});
  const [history, setHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [macroLog, setMacroLog] = useState<Record<string, MacroEntry>>({});
  const [bodyLog, setBodyLog] = useState<BodyEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<CoachMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: sessions } = await supabase
        .from("exercise_sessions").select("*").eq("user_id", user.id).order("date", { ascending: true });

      if (sessions) {
        const hist: Record<string, HistoryEntry[]> = {};
        for (const s of sessions) {
          const key = `d${s.day_index}-e${s.exercise_index}`;
          if (!hist[key]) hist[key] = [];
          hist[key].push({ date: s.date, sets: s.sets as SetLog[], e1rm: s.e1rm, topWeight: s.top_weight, topReps: s.top_reps });
        }
        setHistory(hist);
      }

      const { data: macros } = await supabase.from("macro_logs").select("*").eq("user_id", user.id);
      if (macros) {
        const log: Record<string, MacroEntry> = {};
        for (const m of macros) log[m.date] = { protein: m.protein, carbs: m.carbs, fat: m.fat, calories: m.calories };
        setMacroLog(log);
      }

      const { data: bodies } = await supabase.from("body_logs").select("*").eq("user_id", user.id).order("date", { ascending: true });
      if (bodies) setBodyLog(bodies.map((b) => ({ date: b.date, weight: b.weight, waist: b.waist })));

      const { data: msgs } = await supabase.from("coach_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
      if (msgs) setChatMessages(msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));

      setLoaded(true);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSet = (di: number, ei: number, si: number, field: "weight" | "reps", value: string) => {
    const key = `d${di}-e${ei}`;
    const log = sessionLog[key] || { sets: [] };
    const sets = [...(log.sets || [])];
    if (!sets[si]) sets[si] = { reps: 0, weight: 0 };
    sets[si] = { ...sets[si], [field]: parseFloat(value) || 0 };
    setSessionLog((prev) => ({ ...prev, [key]: { ...log, sets } }));
  };

  const saveSession = useCallback(async (di: number, ei: number) => {
    if (!userId) return;
    const key = `d${di}-e${ei}`;
    const log = sessionLog[key];
    if (!log?.sets?.some((s) => s.weight > 0 && s.reps > 0)) return;

    const topSet = log.sets.reduce((a, s) => (s.weight > a.weight ? s : a), { weight: 0, reps: 0 });
    const e1rm = getE1RM(topSet.weight, topSet.reps);
    const todayKey = todayISO();

    await supabase.from("exercise_sessions").upsert({
      user_id: userId, day_index: di, exercise_index: ei, date: todayKey,
      sets: log.sets, top_weight: topSet.weight, top_reps: topSet.reps, e1rm,
    }, { onConflict: "user_id,day_index,exercise_index,date" });

    const entry: HistoryEntry = { date: todayKey, sets: log.sets, e1rm, topWeight: topSet.weight, topReps: topSet.reps };
    setHistory((prev) => {
      const existing = prev[key] || [];
      const filtered = existing.filter((e) => e.date !== todayKey);
      return { ...prev, [key]: [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date)) };
    });
  }, [userId, sessionLog, supabase]);

  useEffect(() => {
    if (!loaded || !userId) return;
    const todayKey = todayISO();
    const todayMacros = macroLog[todayKey];
    if (!todayMacros) return;
    supabase.from("macro_logs").upsert({ user_id: userId, date: todayKey, ...todayMacros }, { onConflict: "user_id,date" });
  }, [macroLog, loaded, userId, supabase]);

  useEffect(() => {
    if (!loaded || !userId || bodyLog.length === 0) return;
    const latest = bodyLog[bodyLog.length - 1];
    supabase.from("body_logs").upsert({ user_id: userId, date: latest.date, weight: latest.weight, waist: latest.waist }, { onConflict: "user_id,date" });
  }, [bodyLog, loaded, userId, supabase]);

  useEffect(() => {
    if (!loaded || !userId || chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];
    supabase.from("coach_messages").insert({ user_id: userId, role: latest.role, content: latest.content });
  }, [chatMessages.length, loaded, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = PROGRAM[activeDay];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <span className="text-white/20 text-xs uppercase tracking-[0.2em] font-body">Initializing</span>
        </div>
      </div>
    );
  }

  const headerTitle: Record<TabName, string> = {
    Today: day.label.toUpperCase(),
    Progress: "VITALS",
    Macros: "FUEL INTAKE",
    Coach: "INTEL",
  };

  const headerSub: Record<TabName, string> = {
    Today: day.focus,
    Progress: "Strength Output · Body Composition · Records",
    Macros: "2,150 kcal · 190g protein target",
    Coach: "AI Performance Advisor · Claude",
  };

  return (
    <div className="font-body bg-black min-h-screen text-white pb-20 max-w-[430px] mx-auto relative">
      {/* Subtle background grid */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Header */}
      <div className="px-4 pt-5 pb-3 bg-black/80 backdrop-blur-xl sticky top-0 z-10 border-b border-white/[0.06]">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-glow-violet">
              {headerTitle[tab]}
            </div>
            <div className="font-body text-[10px] text-white/25 mt-0.5 uppercase tracking-[0.1em]">
              {headerSub[tab]}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer uppercase tracking-wider font-body">
              Exit
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 glow-violet-sm animate-pulse" />
          </div>
        </div>
      </div>

      {tab === "Today" && <TodayView activeDay={activeDay} setActiveDay={setActiveDay} sessionLog={sessionLog} updateSet={updateSet} saveSession={saveSession} history={history} />}
      {tab === "Progress" && <ProgressView history={history} bodyLog={bodyLog} setBodyLog={setBodyLog} />}
      {tab === "Macros" && <MacrosView macroLog={macroLog} setMacroLog={setMacroLog} />}
      {tab === "Coach" && <CoachView chatMessages={chatMessages} setChatMessages={setChatMessages} chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading} setChatLoading={setChatLoading} history={history} macroLog={macroLog} bodyLog={bodyLog} />}

      {/* Floating bottom nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] z-20">
        <div className="glass-card flex items-center justify-around py-2 px-2" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
          {TABS.map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 cursor-pointer border-none"
                style={{
                  background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                  boxShadow: isActive ? "0 0 12px rgba(139,92,246,0.2)" : "none",
                }}
              >
                <span className="text-base">{TAB_ICONS[t]}</span>
                <span className={`text-[9px] uppercase tracking-[0.15em] font-semibold transition-colors ${isActive ? "text-violet-400" : "text-white/20"}`}>
                  {TAB_LABELS[t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
