"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PROGRAM, fmtDate, todayISO, type HistoryEntry } from "@/lib/program";

interface BodyEntry {
  date: string;
  weight: number | null;
  waist: number | null;
}

interface ProgressViewProps {
  history: Record<string, HistoryEntry[]>;
  bodyLog: BodyEntry[];
  setBodyLog: React.Dispatch<React.SetStateAction<BodyEntry[]>>;
}

export default function ProgressView({ history, bodyLog, setBodyLog }: ProgressViewProps) {
  const [progressDay, setProgressDay] = useState(0);
  const [progressEx, setProgressEx] = useState(0);
  const [bodyInput, setBodyInput] = useState({ weight: "", waist: "" });
  const todayKey = todayISO();

  const getExHistory = (di: number, ei: number): HistoryEntry[] => history[`d${di}-e${ei}`] || [];

  const getChartData = (di: number, ei: number) =>
    getExHistory(di, ei).map((e) => ({
      date: fmtDate(e.date),
      e1rm: e.e1rm,
      weight: e.topWeight,
      reps: e.topReps,
    }));

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
    return { name: ex.name, e1rm: best.e1rm, weight: best.topWeight, reps: best.topReps, date: best.date, color: PROGRAM[di].color };
  }).filter(Boolean).sort((a, b) => b!.e1rm - a!.e1rm).slice(0, 6);

  return (
    <div className="px-3.5 pt-3">
      {/* Body measurements */}
      <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Body Measurements</div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <div className="text-[9px] text-zinc-600 mb-1">WEIGHT (lbs)</div>
            <input type="number" placeholder="192" value={bodyInput.weight} onChange={(e) => setBodyInput((p) => ({ ...p, weight: e.target.value }))} className="bg-[#1c1c1c] border border-zinc-800 rounded-lg text-white text-[13px] px-2.5 py-2 outline-none font-mono text-center w-full" />
          </div>
          <div className="flex-1">
            <div className="text-[9px] text-zinc-600 mb-1">WAIST (in)</div>
            <input type="number" placeholder="34" value={bodyInput.waist} onChange={(e) => setBodyInput((p) => ({ ...p, waist: e.target.value }))} className="bg-[#1c1c1c] border border-zinc-800 rounded-lg text-white text-[13px] px-2.5 py-2 outline-none font-mono text-center w-full" />
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
            className="px-3.5 py-2 bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg font-bold text-xs cursor-pointer self-end"
          >+</button>
        </div>

        {bodyLog.length >= 2 && (
          <div className="mt-2">
            {bodyLog.some((b) => b.weight) && (
              <div className="mb-3">
                <div className="text-[10px] text-zinc-600 mb-1.5 uppercase tracking-wider">Weight (lbs)</div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={bodyLog.filter((b) => b.weight).map((b) => ({ date: fmtDate(b.date), val: b.weight }))}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} name="lbs" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {bodyLog.some((b) => b.waist) && (
              <div>
                <div className="text-[10px] text-zinc-600 mb-1.5 uppercase tracking-wider">Waist (inches)</div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={bodyLog.filter((b) => b.waist).map((b) => ({ date: fmtDate(b.date), val: b.waist }))}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="in" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        {bodyLog.length < 2 && <div className="text-[11px] text-zinc-700 text-center py-2">Log at least 2 entries to see trends</div>}
      </div>

      {/* PRs */}
      {prs.length > 0 && (
        <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Top Estimated 1RMs</div>
          {prs.map((pr, i) => pr && (
            <div key={i} className="flex justify-between py-1.5 items-center" style={{ borderBottom: i < prs.length - 1 ? "1px solid #1c1c1c" : "none" }}>
              <div>
                <div className="text-xs font-semibold">{pr.name}</div>
                <div className="text-[10px] text-zinc-600">{pr.weight}×{pr.reps} · {fmtDate(pr.date)}</div>
              </div>
              <div className="text-sm font-extrabold font-mono" style={{ color: pr.color }}>{pr.e1rm} lbs</div>
            </div>
          ))}
          <div className="text-[9px] text-zinc-700 mt-2">e1RM = estimated 1 rep max via Epley formula</div>
        </div>
      )}

      {/* Strength chart */}
      <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Strength Chart</div>

        {/* Day picker */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-2">
          {PROGRAM.filter((d) => !d.restDay).map((d) => {
            const realIdx = PROGRAM.indexOf(d);
            return (
              <button key={realIdx} onClick={() => { setProgressDay(realIdx); setProgressEx(0); }} className="shrink-0 px-2.5 py-1 rounded-2xl border-none font-bold text-[10px] cursor-pointer whitespace-nowrap" style={{
                background: progressDay === realIdx ? d.color : "#1c1c1c",
                color: progressDay === realIdx ? "#fff" : "#555",
              }}>{d.label}</button>
            );
          })}
        </div>

        {/* Exercise picker */}
        <div className="flex flex-col gap-1 mb-2.5">
          {allExercises.map((ex, ei) => {
            const h = getExHistory(progressDay, ei);
            return (
              <button key={ei} onClick={() => setProgressEx(ei)} className="px-2.5 py-1.5 rounded-lg border-none text-left text-[11px] cursor-pointer flex justify-between items-center" style={{
                background: progressEx === ei ? PROGRAM[progressDay].color + "22" : "#1a1a1a",
                borderLeft: progressEx === ei ? `2px solid ${PROGRAM[progressDay].color}` : "2px solid transparent",
                color: progressEx === ei ? "#fff" : "#555",
                fontWeight: progressEx === ei ? 700 : 400,
              }}>
                <span>{ex.name}</span>
                <span className="text-[10px]" style={{ color: h.length > 0 ? "#22c55e" : "#333" }}>{h.length > 0 ? `${h.length} sessions` : "no data"}</span>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        {chartData.length >= 2 ? (
          <div>
            <div className="text-[10px] text-zinc-600 mb-1.5 uppercase tracking-wider">{currentEx?.name} — Estimated 1RM over time</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} formatter={(val) => [`${val} lbs`]} />
                <Line type="monotone" dataKey="e1rm" stroke={PROGRAM[progressDay].color} strokeWidth={2.5} dot={{ r: 4, fill: PROGRAM[progressDay].color }} name="e1rm" />
                <Line type="monotone" dataKey="weight" stroke="#444" strokeWidth={1.5} dot={{ r: 3, fill: "#444" }} strokeDasharray="4 2" name="weight" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-2.5">
              <div className="text-[10px] text-zinc-700 mb-1.5 uppercase tracking-wider">Session History</div>
              {exHist.slice().reverse().slice(0, 6).map((e, i) => (
                <div key={i} className="flex justify-between py-1" style={{ borderBottom: i < Math.min(exHist.length, 6) - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <div className="text-[11px] text-zinc-500">{fmtDate(e.date)}</div>
                  <div className="text-[11px] font-mono text-zinc-400">{e.topWeight}×{e.topReps}</div>
                  <div className="text-[11px] font-mono" style={{ color: PROGRAM[progressDay].color }}>{e.e1rm} e1RM</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-zinc-700 text-center py-4">
            {chartData.length === 1 ? "1 session logged — need 2+ to see chart" : "No sessions logged yet for this exercise"}
          </div>
        )}
      </div>
    </div>
  );
}
