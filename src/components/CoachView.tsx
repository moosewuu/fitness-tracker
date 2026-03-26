"use client";

import { useRef, useEffect } from "react";
import { MACROS, todayISO, fmtDate, PROGRAM, type HistoryEntry } from "@/lib/program";

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

interface MacroEntry {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface BodyEntry {
  date: string;
  weight: number | null;
  waist: number | null;
}

interface CoachViewProps {
  chatMessages: CoachMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<CoachMessage[]>>;
  chatInput: string;
  setChatInput: (v: string) => void;
  chatLoading: boolean;
  setChatLoading: (v: boolean) => void;
  history: Record<string, HistoryEntry[]>;
  macroLog: Record<string, MacroEntry>;
  bodyLog: BodyEntry[];
}

export default function CoachView({
  chatMessages, setChatMessages, chatInput, setChatInput,
  chatLoading, setChatLoading, history, macroLog, bodyLog,
}: CoachViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const todayKey = todayISO();
  const todayMacros = macroLog[todayKey] || { protein: 0, carbs: 0, fat: 0, calories: 0 };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: CoachMessage = { role: "user", content: chatInput.trim() };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput("");
    setChatLoading(true);

    const progressSummary = Object.entries(history).slice(-8).map(([k, entries]) => {
      const parts = k.split("-");
      const di = parseInt(parts[0].replace("d", ""));
      const ei = parseInt(parts[1].replace("e", ""));
      const ex = PROGRAM[di]?.exercises?.[ei];
      if (!ex || entries.length < 2) return null;
      const first = entries[0];
      const last = entries[entries.length - 1];
      return `${ex.name}: ${first.topWeight}lbs→${last.topWeight}lbs (${entries.length} sessions)`;
    }).filter(Boolean).join("\n");

    const recentBody = bodyLog.slice(-4).map((b) => `${fmtDate(b.date)}: ${b.weight}lbs, waist ${b.waist}in`).join(", ");

    const systemPrompt = `You are a personal fitness coach. User profile:
- 192 lbs, ~6ft, ~20-25% body fat
- Goal: body recomposition — reduce fat, build muscle (priority: shoulders + arms)
- Training: Push/Pull/Legs/Rest/Shoulders+Arms/Chest+Back/Rest
- Targets: ${MACROS.calories} cal, ${MACROS.protein}g protein, ${MACROS.carbs}g carbs, ${MACROS.fat}g fat
- Today's macros: ${todayMacros.protein}g protein, ${todayMacros.carbs}g carbs, ${todayMacros.fat}g fat, ${todayMacros.calories} cal
- Recent body measurements: ${recentBody || "none logged yet"}
- Strength progress:\n${progressSummary || "no history yet"}
Be direct, data-driven, honest. Don't make things up. Keep responses concise and actionable. Reference their actual logged numbers when you have them.`;

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt,
        }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Network error — try again." }]);
    }
    setChatLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex-1 overflow-y-auto px-3.5 pt-3">
        {chatMessages.length === 0 && (
          <div className="bg-[#141414] rounded-[14px] p-5 text-center">
            <div className="text-2xl mb-1.5">🏋️</div>
            <div className="font-bold text-sm mb-1">AI Coach</div>
            <div className="text-[11px] text-zinc-600 leading-relaxed mb-3.5">
              Ask anything about your program, nutrition, or progress. Your workout logs, macros, and body measurements are shared automatically.
            </div>
            {["Am I hitting my protein targets this week?", "Which lifts are progressing fastest?", "Should I adjust my calories given my progress?"].map((q, i) => (
              <button key={i} onClick={() => setChatInput(q)} className="block w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg text-zinc-500 text-[11px] px-3 py-2 cursor-pointer text-left mb-1.5 hover:border-zinc-600 transition-colors">{q}</button>
            ))}
          </div>
        )}

        {chatMessages.map((m, i) => (
          <div key={i} className="mb-2.5" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div className="max-w-[84%] px-3 py-2 text-[13px] leading-relaxed text-white whitespace-pre-wrap" style={{
              borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              background: m.role === "user" ? "#a855f7" : "#141414",
              border: m.role === "assistant" ? "1px solid #1c1c1c" : "none",
            }}>{m.content}</div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-1 px-3 py-2 bg-[#141414] rounded-[14px] w-fit mb-2.5 border border-zinc-800/50">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="px-3.5 py-2.5 bg-[#0d0d0d] border-t border-zinc-800 flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask your coach..."
          className="flex-1 bg-[#1c1c1c] border border-zinc-800 rounded-[10px] text-white text-[13px] px-3 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={chatLoading || !chatInput.trim()}
          className="rounded-[10px] px-3.5 py-2 text-white font-bold text-sm cursor-pointer border-none disabled:opacity-30 transition-colors"
          style={{ background: chatLoading || !chatInput.trim() ? "#1c1c1c" : "#a855f7" }}
        >→</button>
      </div>
    </div>
  );
}
