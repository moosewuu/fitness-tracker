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

  // Load user and data
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      // Load exercise sessions as history
      const { data: sessions } = await supabase
        .from("exercise_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (sessions) {
        const hist: Record<string, HistoryEntry[]> = {};
        for (const s of sessions) {
          const key = `d${s.day_index}-e${s.exercise_index}`;
          if (!hist[key]) hist[key] = [];
          hist[key].push({
            date: s.date,
            sets: s.sets as SetLog[],
            e1rm: s.e1rm,
            topWeight: s.top_weight,
            topReps: s.top_reps,
          });
        }
        setHistory(hist);
      }

      // Load macros
      const { data: macros } = await supabase
        .from("macro_logs")
        .select("*")
        .eq("user_id", user.id);

      if (macros) {
        const log: Record<string, MacroEntry> = {};
        for (const m of macros) {
          log[m.date] = { protein: m.protein, carbs: m.carbs, fat: m.fat, calories: m.calories };
        }
        setMacroLog(log);
      }

      // Load body logs
      const { data: bodies } = await supabase
        .from("body_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (bodies) {
        setBodyLog(bodies.map((b) => ({ date: b.date, weight: b.weight, waist: b.waist })));
      }

      // Load coach messages
      const { data: msgs } = await supabase
        .from("coach_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (msgs) {
        setChatMessages(msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      }

      setLoaded(true);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update set in local session log
  const updateSet = (di: number, ei: number, si: number, field: "weight" | "reps", value: string) => {
    const key = `d${di}-e${ei}`;
    const log = sessionLog[key] || { sets: [] };
    const sets = [...(log.sets || [])];
    if (!sets[si]) sets[si] = { reps: 0, weight: 0 };
    sets[si] = { ...sets[si], [field]: parseFloat(value) || 0 };
    setSessionLog((prev) => ({ ...prev, [key]: { ...log, sets } }));
  };

  // Save session to Supabase
  const saveSession = useCallback(async (di: number, ei: number) => {
    if (!userId) return;
    const key = `d${di}-e${ei}`;
    const log = sessionLog[key];
    if (!log?.sets?.some((s) => s.weight > 0 && s.reps > 0)) return;

    const topSet = log.sets.reduce((a, s) => (s.weight > a.weight ? s : a), { weight: 0, reps: 0 });
    const e1rm = getE1RM(topSet.weight, topSet.reps);
    const todayKey = todayISO();

    await supabase.from("exercise_sessions").upsert({
      user_id: userId,
      day_index: di,
      exercise_index: ei,
      date: todayKey,
      sets: log.sets,
      top_weight: topSet.weight,
      top_reps: topSet.reps,
      e1rm,
    }, { onConflict: "user_id,day_index,exercise_index,date" });

    const entry: HistoryEntry = { date: todayKey, sets: log.sets, e1rm, topWeight: topSet.weight, topReps: topSet.reps };
    setHistory((prev) => {
      const existing = prev[key] || [];
      const filtered = existing.filter((e) => e.date !== todayKey);
      return { ...prev, [key]: [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date)) };
    });
  }, [userId, sessionLog, supabase]);

  // Persist macros to Supabase on change
  useEffect(() => {
    if (!loaded || !userId) return;
    const todayKey = todayISO();
    const todayMacros = macroLog[todayKey];
    if (!todayMacros) return;

    supabase.from("macro_logs").upsert({
      user_id: userId,
      date: todayKey,
      ...todayMacros,
    }, { onConflict: "user_id,date" });
  }, [macroLog, loaded, userId, supabase]);

  // Persist body logs to Supabase on change
  useEffect(() => {
    if (!loaded || !userId || bodyLog.length === 0) return;
    const latest = bodyLog[bodyLog.length - 1];

    supabase.from("body_logs").upsert({
      user_id: userId,
      date: latest.date,
      weight: latest.weight,
      waist: latest.waist,
    }, { onConflict: "user_id,date" });
  }, [bodyLog, loaded, userId, supabase]);

  // Persist coach messages
  useEffect(() => {
    if (!loaded || !userId || chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];

    supabase.from("coach_messages").insert({
      user_id: userId,
      role: latest.role,
      content: latest.content,
    });
  }, [chatMessages.length, loaded, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = PROGRAM[activeDay];
  const tabColor: Record<TabName, string> = { Today: day.color, Progress: "#f59e0b", Macros: "#ef4444", Coach: "#a855f7" };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-sans bg-[#0a0a0a] min-h-screen text-white pb-[72px] max-w-[430px] mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-[#0a0a0a] sticky top-0 z-10 border-b border-zinc-900">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xl font-extrabold tracking-tight">
              {tab === "Today" ? day.label : tab}
            </div>
            <div className="text-[11px] text-zinc-700 mt-0.5">
              {tab === "Today" ? day.focus : tab === "Progress" ? "Strength · Body · PRs" : tab === "Macros" ? "2,150 kcal · 190g protein" : "Powered by Claude"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">Logout</button>
            <div className="w-2 h-2 rounded-full" style={{ background: tabColor[tab], boxShadow: `0 0 10px ${tabColor[tab]}` }} />
          </div>
        </div>
      </div>

      {tab === "Today" && (
        <TodayView
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          sessionLog={sessionLog}
          updateSet={updateSet}
          saveSession={saveSession}
          history={history}
        />
      )}
      {tab === "Progress" && (
        <ProgressView
          history={history}
          bodyLog={bodyLog}
          setBodyLog={setBodyLog}
        />
      )}
      {tab === "Macros" && (
        <MacrosView
          macroLog={macroLog}
          setMacroLog={setMacroLog}
        />
      )}
      {tab === "Coach" && (
        <CoachView
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatLoading={chatLoading}
          setChatLoading={setChatLoading}
          history={history}
          macroLog={macroLog}
          bodyLog={bodyLog}
        />
      )}

      {/* Tab bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex bg-[#0d0d0d] border-t border-zinc-800 z-20">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 pb-2 border-none bg-transparent cursor-pointer text-[10px] uppercase tracking-wide transition-colors"
            style={{ color: tab === t ? tabColor[t] : "#3a3a3a", fontWeight: tab === t ? 700 : 500 }}
          >
            <div className="text-[17px] mb-0.5">
              {t === "Today" ? "💪" : t === "Progress" ? "📈" : t === "Macros" ? "🥩" : "🤖"}
            </div>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
