"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PROGRAM, fmtDate, todayISO, type HistoryEntry } from "@/lib/program";

interface BodyEntry { date: string; weight: number | null; waist: number | null }

interface ProgressViewProps {
  history: Record<string, HistoryEntry[]>;
  bodyLog: BodyEntry[];
  setBodyLog: React.Dispatch<React.SetStateAction<BodyEntry[]>>;
}

const chartTooltipStyle = { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, fontSize: 11 };

export default function ProgressView({ history, bodyLog, setBodyLog }: ProgressViewProps) {
  const [progressDay, setProgressDay] = useState(0);
  const [progressEx, setProgressEx] = useState(0);
  const [bodyInput, setBodyInput] = useState({ weight: "", waist: "" });
  const todayKey = todayISO();

  const getExHistory = (di: number, ei: number): HistoryEntry[] => history[`d${di}-e${ei}`] || [];
  const getChartData = (di: number, ei: number) =>
    getExHistory(di, ei).map((e) => ({ date: fmtDate(e.date), e1rm: e.e1rm, weight: e.topWeight, reps: e.topReps }));

  const chartData = getChartData(progressDay, progressEx);
  const exHist = getExHistory(progressDay, progressEx);
  const currentEx = PROGRAM[progressDay]?.exercises?.[progressEx];
  const allExercises = PROGRAM[progressDay]?.exercises || [];

  const prs = Object.entries(history).map(([k, entries]) => {
    const parts = k.split("-");
    const di = parseInt(parts[0].replace("d", ""));
    const ei = parseInt(parts[1].replace("e", ""));
    const ex = PROGRAM[di]?.exercises?.[ei];
    if (!ex || entries.length === 0) return null;
    const best = entries.reduce((a, e) => (e.e1rm > a.e1rm ? e : a), entries[0]);
    return { name: ex.name, e1rm: best.e1rm, weight: best.topWeight, reps: best.topReps, date: best.date };
  }).filter(Boolean).sort((a, b) => b!.e1rm - a!.e1rm).slice(0, 6);

  return (
    <div className="px-4 pt-3">
      {/* Body measurements */}
      <div className="glass-card p-4 mb-3">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-3 font-body">Body Composition</div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <div className="text-[9px] text-white/20 mb-1 uppercase tracking-wider font-body">Weight (lbs)</div>
            <input type="number" placeholder="192" value={bodyInput.weight} onChange={(e) => setBodyInput((p) => ({ ...p, weight: e.target.value }))} className="hud-input" />
          </div>
          <div className="flex-1">
            <div className="text-[9px] text-white/20 mb-1 uppercase tracking-wider font-body">Waist (in)</div>
            <input type="number" placeholder="34" value={bodyInput.waist} onChange={(e) => setBodyInput((p) => ({ ...p, waist: e.target.value }))} className="hud-input" />
          </div>
          <button
            onClick={() => {
              if (!bodyInput.weight && !bodyInput.waist) return;
              const entry = { date: todayKey, weight: parseFloat(bodyInput.weight) || null, waist: parseFloat(bodyInput.waist) || null };
              setBodyLog((prev) => {
                const filtered = prev.filter((e) => e.date !== todayKey);
                return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
              });
              setBodyInput({ weight: "", waist: "" });
            }}
            className="px-4 py-2 rounded-lg font-display font-bold text-xs cursor-pointer self-end border transition-all"
            style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#A78BFA" }}
          >+</button>
        </div>

        {bodyLog.length >= 2 && (
          <div className="mt-3">
            {bodyLog.some((b) => b.weight) && (
              <div className="mb-3">
                <div className="text-[10px] text-white/20 mb-1.5 uppercase tracking-[0.1em] font-body">Weight Trend</div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={bodyLog.filter((b) => b.weight).map((b) => ({ date: fmtDate(b.date), val: b.weight }))}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="val" stroke="#22D3EE" strokeWidth={2} dot={{ r: 3, fill: "#22D3EE", strokeWidth: 0 }} name="lbs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {bodyLog.some((b) => b.waist) && (
              <div>
                <div className="text-[10px] text-white/20 mb-1.5 uppercase tracking-[0.1em] font-body">Waist Trend</div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={bodyLog.filter((b) => b.waist).map((b) => ({ date: fmtDate(b.date), val: b.waist }))}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="val" stroke="#F97316" strokeWidth={2} dot={{ r: 3, fill: "#F97316", strokeWidth: 0 }} name="in" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        {bodyLog.length < 2 && <div className="text-[11px] text-white/15 text-center py-2 font-body">Log at least 2 entries to see trends</div>}
      </div>

      {/* PRs */}
      {prs.length > 0 && (
        <div className="glass-card p-4 mb-3">
          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-3 font-body">Peak Output Records</div>
          {prs.map((pr, i) => pr && (
            <div key={i} className="flex justify-between py-2 items-center" style={{ borderBottom: i < prs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div>
                <div className="text-xs font-display font-semibold text-white/80">{pr.name}</div>
                <div className="text-[10px] text-white/20 font-body">{pr.weight}×{pr.reps} · {fmtDate(pr.date)}</div>
              </div>
              <div className="text-sm font-display font-bold text-violet-400 text-glow-violet">{pr.e1rm} lbs</div>
            </div>
          ))}
          <div className="text-[9px] text-white/10 mt-2 font-body uppercase tracking-wider">e1RM = estimated 1 rep max via Epley formula</div>
        </div>
      )}

      {/* Strength chart */}
      <div className="glass-card p-4 mb-3">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-3 font-body">Strength Output</div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-2">
          {PROGRAM.filter((d) => !d.restDay).map((d) => {
            const realIdx = PROGRAM.indexOf(d);
            return (
              <button key={realIdx} onClick={() => { setProgressDay(realIdx); setProgressEx(0); }}
                className="shrink-0 px-2.5 py-1 rounded-lg border font-display font-semibold text-[10px] cursor-pointer whitespace-nowrap transition-all"
                style={{
                  background: progressDay === realIdx ? "rgba(139,92,246,0.15)" : "transparent",
                  borderColor: progressDay === realIdx ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
                  color: progressDay === realIdx ? "#A78BFA" : "rgba(255,255,255,0.2)",
                }}
              >{d.label.toUpperCase()}</button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 mb-3">
          {allExercises.map((ex, ei) => {
            const h = getExHistory(progressDay, ei);
            return (
              <button key={ei} onClick={() => setProgressEx(ei)}
                className="px-2.5 py-1.5 rounded-lg border-none text-left text-[11px] cursor-pointer flex justify-between items-center transition-all font-body"
                style={{
                  background: progressEx === ei ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                  borderLeft: progressEx === ei ? "2px solid #8B5CF6" : "2px solid transparent",
                  color: progressEx === ei ? "#A78BFA" : "rgba(255,255,255,0.25)",
                  fontWeight: progressEx === ei ? 600 : 400,
                }}
              >
                <span>{ex.name}</span>
                <span className="text-[10px]" style={{ color: h.length > 0 ? "#22D3EE" : "rgba(255,255,255,0.1)" }}>{h.length > 0 ? `${h.length} sessions` : "no data"}</span>
              </button>
            );
          })}
        </div>

        {chartData.length >= 2 ? (
          <div>
            <div className="text-[10px] text-white/20 mb-1.5 uppercase tracking-[0.1em] font-body">{currentEx?.name} — Estimated 1RM</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => [`${val} lbs`]} />
                <Line type="monotone" dataKey="e1rm" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }} name="e1rm" />
                <Line type="monotone" dataKey="weight" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} dot={{ r: 3, fill: "rgba(255,255,255,0.15)", strokeWidth: 0 }} strokeDasharray="4 2" name="weight" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-2.5">
              <div className="text-[10px] text-white/15 mb-1.5 uppercase tracking-[0.1em] font-body">Session Log</div>
              {exHist.slice().reverse().slice(0, 6).map((e, i) => (
                <div key={i} className="flex justify-between py-1" style={{ borderBottom: i < Math.min(exHist.length, 6) - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                  <div className="text-[11px] text-white/20 font-body">{fmtDate(e.date)}</div>
                  <div className="text-[11px] font-display text-white/30">{e.topWeight}×{e.topReps}</div>
                  <div className="text-[11px] font-display text-violet-400">{e.e1rm} e1RM</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-white/15 text-center py-4 font-body">
            {chartData.length === 1 ? "1 session logged — need 2+ for visualization" : "No sessions recorded for this movement"}
          </div>
        )}
      </div>
    </div>
  );
}
