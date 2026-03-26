"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { MACROS, fmtDate, todayISO } from "@/lib/program";

interface MacroEntry { protein: number; carbs: number; fat: number; calories: number }

interface MacrosViewProps {
  macroLog: Record<string, MacroEntry>;
  setMacroLog: React.Dispatch<React.SetStateAction<Record<string, MacroEntry>>>;
}

const chartTooltipStyle = { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, fontSize: 11 };

export default function MacrosView({ macroLog, setMacroLog }: MacrosViewProps) {
  const [inp, setInp] = useState({ protein: "", carbs: "", fat: "", calories: "" });
  const todayKey = todayISO();
  const todayMacros = macroLog[todayKey] || { protein: 0, carbs: 0, fat: 0, calories: 0 };

  const addMacros = () => {
    const update = {
      protein: (todayMacros.protein || 0) + (parseFloat(inp.protein) || 0),
      carbs: (todayMacros.carbs || 0) + (parseFloat(inp.carbs) || 0),
      fat: (todayMacros.fat || 0) + (parseFloat(inp.fat) || 0),
      calories: (todayMacros.calories || 0) + (parseFloat(inp.calories) || 0),
    };
    setMacroLog((prev) => ({ ...prev, [todayKey]: update }));
    setInp({ protein: "", carbs: "", fat: "", calories: "" });
  };

  const bars = [
    { label: "Energy", key: "calories" as const, target: MACROS.calories, color: "#8B5CF6", unit: "kcal" },
    { label: "Protein", key: "protein" as const, target: MACROS.protein, color: "#F43F5E", unit: "g" },
    { label: "Carbs", key: "carbs" as const, target: MACROS.carbs, color: "#22D3EE", unit: "g" },
    { label: "Fat", key: "fat" as const, target: MACROS.fat, color: "#F59E0B", unit: "g" },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const log = macroLog[key] || { protein: 0, calories: 0 };
    return { date: fmtDate(key), protein: log.protein || 0, calories: log.calories || 0 };
  });

  return (
    <div className="px-4 pt-3">
      {/* Today vitals */}
      <div className="glass-card p-4 mb-3">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-3 font-body">Today · {fmtDate(todayKey)}</div>
        {bars.map((b, i) => {
          const val = todayMacros[b.key] || 0;
          const pct = Math.min((val / b.target) * 100, 100);
          const isComplete = pct >= 100;
          return (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-display font-semibold text-white/60 uppercase">{b.label}</span>
                <span className="text-[11px] font-display" style={{ color: isComplete ? "#10B981" : b.color }}>
                  {Math.round(val)}<span className="text-white/20 text-[10px]">/{b.target}{b.unit}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isComplete ? "#10B981" : b.color,
                    boxShadow: `0 0 8px ${isComplete ? "rgba(16,185,129,0.4)" : b.color + "40"}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Log fuel */}
      <div className="glass-card p-4 mb-3">
        <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-3 font-body">Log Fuel Intake</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <div className="text-[9px] text-white/20 mb-1 uppercase tracking-wider font-body">{k}</div>
              <input type="number" placeholder="0" value={inp[k]} onChange={(e) => setInp((p) => ({ ...p, [k]: e.target.value }))} className="hud-input" />
            </div>
          ))}
        </div>
        <button onClick={addMacros} className="w-full rounded-lg py-2.5 font-display font-bold text-xs cursor-pointer border uppercase tracking-wider transition-all glow-violet-sm" style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#A78BFA" }}>
          + Add Intake
        </button>
      </div>

      {/* 7-day protein chart */}
      {last7.some((d) => d.protein > 0) && (
        <div className="glass-card p-4 mb-3">
          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 font-body">7-Day Protein (g)</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={last7}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, Math.max(MACROS.protein * 1.2, ...last7.map((d) => d.protein))]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <ReferenceLine y={MACROS.protein} stroke="rgba(244,63,94,0.2)" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="protein" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3, fill: "#F43F5E", strokeWidth: 0 }} name="protein (g)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-[9px] text-white/10 text-right font-body uppercase tracking-wider">Dashed = 190g target</div>
        </div>
      )}

      {/* 7-day calories chart */}
      {last7.some((d) => d.calories > 0) && (
        <div className="glass-card p-4 mb-3">
          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em] mb-2 font-body">7-Day Energy (kcal)</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={last7}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, Math.max(MACROS.calories * 1.2, ...last7.map((d) => d.calories))]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <ReferenceLine y={MACROS.calories} stroke="rgba(139,92,246,0.2)" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="calories" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 0 }} name="calories" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-[9px] text-white/10 text-right font-body uppercase tracking-wider">Dashed = 2,150 target</div>
        </div>
      )}

      <button onClick={() => setMacroLog((prev) => ({ ...prev, [todayKey]: { protein: 0, carbs: 0, fat: 0, calories: 0 } }))}
        className="w-full bg-transparent border border-white/[0.06] text-white/15 rounded-lg py-2 text-[11px] cursor-pointer mb-4 font-body uppercase tracking-wider hover:text-white/25 hover:border-white/10 transition-all">
        Reset Today&apos;s Log
      </button>
    </div>
  );
}
