"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { MACROS, fmtDate, todayISO } from "@/lib/program";

interface MacroEntry {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface MacrosViewProps {
  macroLog: Record<string, MacroEntry>;
  setMacroLog: React.Dispatch<React.SetStateAction<Record<string, MacroEntry>>>;
}

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
    { label: "Calories", key: "calories" as const, target: MACROS.calories, color: "#f97316", unit: "kcal" },
    { label: "Protein", key: "protein" as const, target: MACROS.protein, color: "#ef4444", unit: "g" },
    { label: "Carbs", key: "carbs" as const, target: MACROS.carbs, color: "#0ea5e9", unit: "g" },
    { label: "Fat", key: "fat" as const, target: MACROS.fat, color: "#a855f7", unit: "g" },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const log = macroLog[key] || { protein: 0, calories: 0 };
    return { date: fmtDate(key), protein: log.protein || 0, calories: log.calories || 0 };
  });

  return (
    <div className="px-3.5 pt-3">
      {/* Today progress */}
      <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Today · {fmtDate(todayKey)}</div>
        {bars.map((b, i) => {
          const val = todayMacros[b.key] || 0;
          const pct = Math.min((val / b.target) * 100, 100);
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-semibold">{b.label}</span>
                <span className="text-[11px] font-mono" style={{ color: pct >= 100 ? "#22c55e" : b.color }}>
                  {Math.round(val)}{b.unit} / {b.target}{b.unit}
                </span>
              </div>
              <div className="h-1.5 bg-[#1c1c1c] rounded-sm overflow-hidden">
                <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${pct}%`, background: pct >= 100 ? "#22c55e" : b.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Log meal */}
      <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Log a Meal</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <div className="text-[9px] text-zinc-600 mb-1 uppercase">{k}</div>
              <input type="number" placeholder="0" value={inp[k]} onChange={(e) => setInp((p) => ({ ...p, [k]: e.target.value }))} className="bg-[#1c1c1c] border border-zinc-800 rounded-lg text-white text-[13px] px-2.5 py-2 outline-none font-mono text-center w-full" />
            </div>
          ))}
        </div>
        <button onClick={addMacros} className="w-full bg-red-500/10 border border-red-500/25 text-red-500 rounded-lg py-2 font-bold text-xs cursor-pointer">+ Add to Today</button>
      </div>

      {/* 7-day protein chart */}
      {last7.some((d) => d.protein > 0) && (
        <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">7-Day Protein (g)</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={last7}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, Math.max(MACROS.protein * 1.2, ...last7.map((d) => d.protein))]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine y={MACROS.protein} stroke="#ef444440" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} name="protein (g)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-[9px] text-zinc-700 text-right">Dashed = 190g target</div>
        </div>
      )}

      {/* 7-day calories chart */}
      {last7.some((d) => d.calories > 0) && (
        <div className="bg-[#141414] rounded-[14px] p-3.5 mb-2.5">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">7-Day Calories</div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={last7}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, Math.max(MACROS.calories * 1.2, ...last7.map((d) => d.calories))]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine y={MACROS.calories} stroke="#f9731640" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="calories" />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-[9px] text-zinc-700 text-right">Dashed = 2,150 target</div>
        </div>
      )}

      <button
        onClick={() => setMacroLog((prev) => ({ ...prev, [todayKey]: { protein: 0, carbs: 0, fat: 0, calories: 0 } }))}
        className="w-full bg-transparent border border-zinc-800 text-zinc-700 rounded-lg py-2 text-[11px] cursor-pointer mb-3.5"
      >
        Reset Today&apos;s Log
      </button>
    </div>
  );
}
