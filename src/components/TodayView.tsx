"use client";

import { PROGRAM, getRecommendation, todayISO, type SetLog, type HistoryEntry } from "@/lib/program";

interface TodayViewProps {
  activeDay: number;
  setActiveDay: (d: number) => void;
  sessionLog: Record<string, { sets: SetLog[] }>;
  updateSet: (di: number, ei: number, si: number, field: "weight" | "reps", value: string) => void;
  saveSession: (di: number, ei: number) => void;
  history: Record<string, HistoryEntry[]>;
}

export default function TodayView({ activeDay, setActiveDay, sessionLog, updateSet, saveSession, history }: TodayViewProps) {
  const day = PROGRAM[activeDay];
  const todayKey = todayISO();

  const getLog = (di: number, ei: number) => sessionLog[`d${di}-e${ei}`] || { sets: [] };
  const getExHistory = (di: number, ei: number): HistoryEntry[] => history[`d${di}-e${ei}`] || [];

  return (
    <div className="px-3.5 pt-3">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2.5 scrollbar-hide">
        {PROGRAM.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className="shrink-0 px-3 py-1.5 rounded-full border-none font-bold text-[11px] cursor-pointer whitespace-nowrap transition-colors"
            style={{
              background: activeDay === i ? d.color : "#1c1c1c",
              color: activeDay === i ? "#fff" : "#555",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5" style={{ borderLeft: `3px solid ${day.color}` }}>
        <span className="inline-block text-[10px] font-bold rounded-full px-2.5 py-0.5" style={{ color: day.color, background: day.color + "18", border: `1px solid ${day.color}30` }}>
          {day.day}
        </span>
        <div className="text-xl font-extrabold mt-1.5">{day.label}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5">{day.focus}</div>
        {day.note && (
          <div className="text-[11px] text-zinc-500 mt-2 p-2 bg-[#1a1a1a] rounded-lg leading-relaxed">{day.note}</div>
        )}
      </div>

      {/* Rest day */}
      {day.restDay && (
        <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Recovery Checklist</div>
          {day.restNotes?.map((n, i) => (
            <div key={i} className="flex gap-2.5 py-1.5 items-center" style={{ borderBottom: i < (day.restNotes?.length || 0) - 1 ? "1px solid #1c1c1c" : "none" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: day.color }} />
              <div className="text-[13px] text-zinc-400">{n}</div>
            </div>
          ))}
        </div>
      )}

      {/* Exercises */}
      {!day.restDay && day.exercises.map((ex, ei) => {
        const log = getLog(activeDay, ei);
        const hist = getExHistory(activeDay, ei);
        const rec = getRecommendation(ex, hist);
        const sets = Array.from({ length: ex.sets }, (_, si) => log.sets?.[si] || { reps: 0, weight: 0 });
        const saved = hist.some((e) => e.date === todayKey);

        return (
          <div key={ei} className="bg-[#141414] rounded-[14px] p-3.5 mb-2">
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex-1">
                <div className="font-bold text-[13px]">{ex.name}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{ex.sets} sets · {ex.repLow}-{ex.repHigh} reps · {ex.notes}</div>
              </div>
              {saved && <div className="text-[10px] text-green-500 font-bold">✓ Saved</div>}
            </div>

            {/* Benchmarks */}
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 bg-[#1a1a1a] rounded-[7px] p-1.5 px-2">
                <div className="text-[8px] text-zinc-700 font-bold uppercase tracking-wider">Inter</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{ex.inter}</div>
              </div>
              <div className="flex-1 bg-[#1a1a1a] rounded-[7px] p-1.5 px-2" style={{ border: `1px solid ${day.color}20` }}>
                <div className="text-[8px] text-zinc-700 font-bold uppercase tracking-wider">Advanced</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: day.color }}>{ex.adv}</div>
              </div>
              {hist.length > 0 && (
                <div className="flex-1 bg-[#1a1a1a] rounded-[7px] p-1.5 px-2 border border-amber-500/10">
                  <div className="text-[8px] text-zinc-700 font-bold uppercase tracking-wider">Last</div>
                  <div className="text-[10px] text-amber-500 font-mono mt-0.5">{hist[hist.length - 1].topWeight}×{hist[hist.length - 1].topReps}</div>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {rec && (
              <div className="mb-2 p-1.5 px-2 rounded-[7px] text-[11px] leading-relaxed" style={{
                background: rec.type === "increase" ? "#0d2d1a" : rec.type === "decrease" ? "#2d0d0d" : "#0d1a2d",
                border: `1px solid ${rec.type === "increase" ? "#22c55e30" : rec.type === "decrease" ? "#ef444430" : "#3b82f630"}`,
                color: rec.type === "increase" ? "#22c55e" : rec.type === "decrease" ? "#ef4444" : "#60a5fa",
              }}>
                {rec.type === "increase" ? "↑ " : rec.type === "decrease" ? "↓ " : "→ "}{rec.msg}
              </div>
            )}

            {/* Set grid header */}
            <div className="grid grid-cols-[20px_1fr_1fr] gap-1.5 mb-1">
              <div className="text-[9px] text-zinc-700 text-center">#</div>
              <div className="text-[9px] text-zinc-700 text-center">LBS</div>
              <div className="text-[9px] text-zinc-700 text-center">REPS</div>
            </div>

            {sets.map((s, si) => (
              <div key={si} className="grid grid-cols-[20px_1fr_1fr] gap-1.5 mb-1">
                <div className="text-[11px] text-zinc-700 text-center pt-2 font-mono">{si + 1}</div>
                <input
                  type="number"
                  placeholder="0"
                  value={s.weight || ""}
                  onChange={(e) => updateSet(activeDay, ei, si, "weight", e.target.value)}
                  className="bg-[#1c1c1c] border border-zinc-800 rounded-lg text-white text-[13px] px-2.5 py-2 outline-none font-mono text-center w-full"
                />
                <input
                  type="number"
                  placeholder="0"
                  value={s.reps || ""}
                  onChange={(e) => updateSet(activeDay, ei, si, "reps", e.target.value)}
                  className="bg-[#1c1c1c] border border-zinc-800 rounded-lg text-white text-[13px] px-2.5 py-2 outline-none font-mono text-center w-full"
                />
              </div>
            ))}

            <button
              onClick={() => saveSession(activeDay, ei)}
              className="mt-1 w-full rounded-lg py-1.5 font-bold text-[11px] cursor-pointer border transition-colors"
              style={{
                background: saved ? "#0d2d1a" : day.color + "20",
                borderColor: saved ? "#22c55e40" : day.color + "40",
                color: saved ? "#22c55e" : day.color,
              }}
            >
              {saved ? "✓ Session Saved" : "Save Session"}
            </button>
          </div>
        );
      })}

      {/* Session tips */}
      {!day.restDay && (
        <div className="bg-[#0f0f0f] rounded-[14px] p-3.5 mb-3.5 border border-zinc-800/50">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Session Notes</div>
          {["2-3 min rest between compound lifts", "60-90 sec rest between isolation", "Strength drops → check sleep + calories first"].map((n, i) => (
            <div key={i} className="flex gap-2 py-1 items-start">
              <div className="text-[11px] shrink-0 mt-0.5" style={{ color: day.color }}>→</div>
              <div className="text-[11px] text-zinc-600">{n}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
