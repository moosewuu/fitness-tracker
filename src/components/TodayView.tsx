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
    <div className="px-4 pt-3">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
        {PROGRAM.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className="shrink-0 px-3.5 py-1.5 rounded-lg font-display font-semibold text-[11px] cursor-pointer whitespace-nowrap transition-all duration-200 border"
            style={{
              background: activeDay === i ? "rgba(139,92,246,0.2)" : "transparent",
              borderColor: activeDay === i ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
              color: activeDay === i ? "#A78BFA" : "rgba(255,255,255,0.25)",
              boxShadow: activeDay === i ? "0 0 12px rgba(139,92,246,0.15)" : "none",
            }}
          >
            {d.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="glass-card p-4 mb-3" style={{ borderLeft: "3px solid #8B5CF6" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-display font-semibold uppercase tracking-[0.15em] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
            {day.day}
          </span>
        </div>
        <div className="font-display text-xl font-bold text-glow-violet">{day.label.toUpperCase()}</div>
        <div className="text-[11px] text-white/25 mt-0.5 uppercase tracking-wider font-body">{day.focus}</div>
        {day.note && (
          <div className="text-[11px] text-white/30 mt-3 p-2.5 bg-white/[0.03] rounded-lg leading-relaxed border border-white/[0.05] font-body">{day.note}</div>
        )}
      </div>

      {/* Rest day */}
      {day.restDay && (
        <div className="glass-card p-4 mb-3">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3 font-body">Recovery Protocol</div>
          {day.restNotes?.map((n, i) => (
            <div key={i} className="flex gap-2.5 py-2 items-center" style={{ borderBottom: i < (day.restNotes?.length || 0) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green shrink-0" />
              <div className="text-[13px] text-white/50 font-body">{n}</div>
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
          <div key={ei} className="glass-card p-4 mb-2.5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-display font-bold text-[13px] text-white/90">{ex.name}</div>
                <div className="text-[10px] text-white/20 mt-0.5 font-body">{ex.sets} sets · {ex.repLow}-{ex.repHigh} reps · {ex.notes}</div>
              </div>
              {saved && <div className="text-[10px] text-emerald-400 font-display font-bold uppercase tracking-wider glow-green px-2 py-0.5 rounded bg-emerald-500/10">Logged</div>}
            </div>

            {/* Benchmarks */}
            <div className="flex gap-1.5 mb-2.5">
              <div className="flex-1 bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[8px] text-white/20 font-semibold uppercase tracking-[0.15em] font-body">Inter</div>
                <div className="text-[10px] text-white/35 font-display mt-0.5">{ex.inter}</div>
              </div>
              <div className="flex-1 bg-violet-500/[0.06] rounded-lg p-2 border border-violet-500/[0.15]">
                <div className="text-[8px] text-white/20 font-semibold uppercase tracking-[0.15em] font-body">Advanced</div>
                <div className="text-[10px] text-violet-400 font-display mt-0.5">{ex.adv}</div>
              </div>
              {hist.length > 0 && (
                <div className="flex-1 bg-cyan-500/[0.06] rounded-lg p-2 border border-cyan-500/[0.15]">
                  <div className="text-[8px] text-white/20 font-semibold uppercase tracking-[0.15em] font-body">Last</div>
                  <div className="text-[10px] text-cyan-400 font-display mt-0.5">{hist[hist.length - 1].topWeight}×{hist[hist.length - 1].topReps}</div>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {rec && (
              <div className="mb-2.5 p-2 px-3 rounded-lg text-[11px] leading-relaxed font-body border" style={{
                background: rec.type === "increase" ? "rgba(16,185,129,0.06)" : rec.type === "decrease" ? "rgba(244,63,94,0.06)" : "rgba(139,92,246,0.06)",
                borderColor: rec.type === "increase" ? "rgba(16,185,129,0.15)" : rec.type === "decrease" ? "rgba(244,63,94,0.15)" : "rgba(139,92,246,0.15)",
                color: rec.type === "increase" ? "#34D399" : rec.type === "decrease" ? "#FB7185" : "#A78BFA",
              }}>
                {rec.type === "increase" ? "↑ " : rec.type === "decrease" ? "↓ " : "→ "}{rec.msg}
              </div>
            )}

            {/* Set grid header */}
            <div className="grid grid-cols-[20px_1fr_1fr] gap-1.5 mb-1">
              <div className="text-[9px] text-white/15 text-center uppercase font-body">Set</div>
              <div className="text-[9px] text-white/15 text-center uppercase font-body">Load</div>
              <div className="text-[9px] text-white/15 text-center uppercase font-body">Reps</div>
            </div>

            {sets.map((s, si) => (
              <div key={si} className="grid grid-cols-[20px_1fr_1fr] gap-1.5 mb-1">
                <div className="text-[11px] text-white/15 text-center pt-2 font-display">{si + 1}</div>
                <input type="number" placeholder="0" value={s.weight || ""} onChange={(e) => updateSet(activeDay, ei, si, "weight", e.target.value)} className="hud-input" />
                <input type="number" placeholder="0" value={s.reps || ""} onChange={(e) => updateSet(activeDay, ei, si, "reps", e.target.value)} className="hud-input" />
              </div>
            ))}

            <button
              onClick={() => saveSession(activeDay, ei)}
              className="mt-2 w-full rounded-lg py-2 font-display font-bold text-[11px] cursor-pointer border uppercase tracking-wider transition-all duration-200"
              style={{
                background: saved ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)",
                borderColor: saved ? "rgba(16,185,129,0.3)" : "rgba(139,92,246,0.3)",
                color: saved ? "#34D399" : "#A78BFA",
                boxShadow: saved ? "0 0 10px rgba(16,185,129,0.1)" : "0 0 10px rgba(139,92,246,0.1)",
              }}
            >
              {saved ? "✓ Session Recorded" : "Record Session"}
            </button>
          </div>
        );
      })}

      {/* Session tips */}
      {!day.restDay && (
        <div className="glass-card p-4 mb-4">
          <div className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] mb-2 font-body">Session Protocol</div>
          {["2-3 min recovery between compound movements", "60-90 sec recovery between isolation work", "Output dropping → audit sleep + fuel intake first"].map((n, i) => (
            <div key={i} className="flex gap-2 py-1 items-start">
              <div className="text-[11px] shrink-0 mt-0.5 text-violet-500">▸</div>
              <div className="text-[11px] text-white/25 font-body">{n}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
