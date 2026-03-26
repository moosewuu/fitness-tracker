export interface Exercise {
  name: string;
  sets: number;
  repLow: number;
  repHigh: number;
  notes: string;
  inter: string;
  adv: string;
  weightIncrement: number;
}

export interface ProgramDay {
  day: string;
  label: string;
  focus: string;
  color: string;
  restDay: boolean;
  note?: string;
  restNotes?: string[];
  exercises: Exercise[];
}

export const PROGRAM: ProgramDay[] = [
  {
    day: "Day 1", label: "Push", focus: "Chest · Shoulders · Triceps",
    color: "#0ea5e9", restDay: false,
    exercises: [
      { name: "Barbell Bench Press", sets: 4, repLow: 6, repHigh: 8, notes: "Control the descent.", inter: "185-225 lbs", adv: "275-315 lbs", weightIncrement: 5 },
      { name: "Incline Dumbbell Press", sets: 3, repLow: 8, repHigh: 10, notes: "Upper chest emphasis. Full ROM.", inter: "65-80/hand", adv: "95-115/hand", weightIncrement: 5 },
      { name: "Cable Chest Fly", sets: 3, repLow: 12, repHigh: 15, notes: "Stretch at bottom, squeeze at top.", inter: "30-40/side", adv: "50-65/side", weightIncrement: 5 },
      { name: "Seated DB Overhead Press", sets: 3, repLow: 8, repHigh: 10, notes: "Shoulders hit while still fresh.", inter: "50-65/hand", adv: "80-100/hand", weightIncrement: 5 },
      { name: "Lateral Raises", sets: 3, repLow: 15, repHigh: 20, notes: "Light, controlled. Pause at top.", inter: "20-30 lbs", adv: "40-50 lbs", weightIncrement: 2.5 },
      { name: "Tricep Pushdown", sets: 3, repLow: 12, repHigh: 15, notes: "Elbows pinned to sides.", inter: "50-70 lbs", adv: "90-120 lbs", weightIncrement: 5 },
      { name: "Skull Crushers", sets: 3, repLow: 10, repHigh: 12, notes: "Keep elbows stationary.", inter: "75-95 lbs", adv: "115-135 lbs", weightIncrement: 5 },
    ]
  },
  {
    day: "Day 2", label: "Pull", focus: "Back · Biceps",
    color: "#a855f7", restDay: false,
    exercises: [
      { name: "Pull-ups / Lat Pulldown", sets: 4, repLow: 6, repHigh: 10, notes: "Full ROM. Dead hang to chin over bar.", inter: "BW×8-10 / 130-160", adv: "+45 lbs / 190-220", weightIncrement: 5 },
      { name: "Barbell Row", sets: 4, repLow: 6, repHigh: 8, notes: "Hinge at hips, row to lower chest.", inter: "155-185 lbs", adv: "225-275 lbs", weightIncrement: 5 },
      { name: "Seated Cable Row", sets: 3, repLow: 10, repHigh: 12, notes: "Squeeze shoulder blades at end.", inter: "130-160 lbs", adv: "190-230 lbs", weightIncrement: 5 },
      { name: "Face Pulls", sets: 3, repLow: 15, repHigh: 20, notes: "Rear delt and shoulder health.", inter: "40-60 lbs", adv: "70-90 lbs", weightIncrement: 5 },
      { name: "EZ Bar Curl", sets: 3, repLow: 8, repHigh: 10, notes: "Primary bicep strength movement.", inter: "75-95 lbs", adv: "115-135 lbs", weightIncrement: 5 },
      { name: "Cable Curl", sets: 3, repLow: 12, repHigh: 15, notes: "Constant tension. Squeeze at top.", inter: "40-55 lbs", adv: "70-90 lbs", weightIncrement: 5 },
    ]
  },
  {
    day: "Day 3", label: "Legs", focus: "Quads · Hamstrings · Glutes · Calves",
    color: "#f97316", restDay: false,
    exercises: [
      { name: "Barbell Back Squat", sets: 4, repLow: 6, repHigh: 8, notes: "Depth matters.", inter: "225-275 lbs", adv: "335-405 lbs", weightIncrement: 5 },
      { name: "Romanian Deadlift", sets: 4, repLow: 8, repHigh: 10, notes: "Don't round lower back.", inter: "185-225 lbs", adv: "275-335 lbs", weightIncrement: 5 },
      { name: "Leg Press", sets: 3, repLow: 10, repHigh: 12, notes: "Feet position changes emphasis.", inter: "270-360 lbs", adv: "450-540 lbs", weightIncrement: 10 },
      { name: "Leg Curl", sets: 3, repLow: 12, repHigh: 15, notes: "Hamstring isolation. Controlled.", inter: "80-110 lbs", adv: "130-160 lbs", weightIncrement: 5 },
      { name: "Leg Extension", sets: 3, repLow: 12, repHigh: 15, notes: "Quad isolation. Full ROM.", inter: "90-120 lbs", adv: "150-185 lbs", weightIncrement: 5 },
      { name: "Standing Calf Raise", sets: 4, repLow: 15, repHigh: 20, notes: "Full ROM. Pause at stretch.", inter: "135-185 lbs", adv: "225-275 lbs", weightIncrement: 10 },
    ]
  },
  {
    day: "Day 4", label: "Rest", focus: "Recovery · Nutrition · Steps",
    color: "#22c55e", restDay: true,
    restNotes: ["Hit 10,000 steps", "7-9 hours sleep", "Hit 190g protein", "Light stretching optional"],
    exercises: []
  },
  {
    day: "Day 5", label: "Shoulders + Arms", focus: "Priority Day · Delts · Biceps · Triceps",
    color: "#ef4444", restDay: false,
    note: "Placed after rest — you're fresh. Priority session.",
    exercises: [
      { name: "Seated DB Overhead Press", sets: 4, repLow: 8, repHigh: 10, notes: "Go heavier than Day 1.", inter: "50-65/hand", adv: "80-100/hand", weightIncrement: 5 },
      { name: "Lateral Raises", sets: 4, repLow: 15, repHigh: 20, notes: "Key for shoulder width. Light, controlled.", inter: "20-30 lbs", adv: "40-50 lbs", weightIncrement: 2.5 },
      { name: "Rear Delt Fly", sets: 3, repLow: 15, repHigh: 20, notes: "Critical for shoulder balance.", inter: "20-30/hand", adv: "40-55/hand", weightIncrement: 2.5 },
      { name: "Incline DB Curl", sets: 3, repLow: 10, repHigh: 12, notes: "Long head stretch. Key for arm peak.", inter: "30-40/hand", adv: "50-65/hand", weightIncrement: 5 },
      { name: "Hammer Curl", sets: 3, repLow: 10, repHigh: 12, notes: "Brachialis and forearm.", inter: "35-45/hand", adv: "55-70/hand", weightIncrement: 5 },
      { name: "Overhead Tricep Extension", sets: 3, repLow: 10, repHigh: 12, notes: "Long head — biggest part of tricep.", inter: "60-80 lbs", adv: "100-120 lbs", weightIncrement: 5 },
      { name: "Tricep Pushdown", sets: 3, repLow: 12, repHigh: 15, notes: "Finish triceps with isolation.", inter: "50-70 lbs", adv: "90-120 lbs", weightIncrement: 5 },
    ]
  },
  {
    day: "Day 6", label: "Chest + Back", focus: "Chest 2nd stimulus · Back maintained · Arms",
    color: "#3b82f6", restDay: false,
    note: "Back is already ahead — maintain it. Chest gets its second hit.",
    exercises: [
      { name: "Incline DB Press", sets: 4, repLow: 8, repHigh: 10, notes: "Upper chest priority.", inter: "65-80/hand", adv: "95-115/hand", weightIncrement: 5 },
      { name: "Cable Chest Fly", sets: 3, repLow: 12, repHigh: 15, notes: "Full stretch. Chest finisher.", inter: "30-40/side", adv: "50-65/side", weightIncrement: 5 },
      { name: "Chest Supported Row", sets: 4, repLow: 10, repHigh: 12, notes: "Removes lower back fatigue.", inter: "45-60/hand", adv: "75-95/hand", weightIncrement: 5 },
      { name: "Straight Arm Pulldown", sets: 3, repLow: 12, repHigh: 15, notes: "Lat isolation.", inter: "50-70 lbs", adv: "85-110 lbs", weightIncrement: 5 },
      { name: "Face Pulls", sets: 3, repLow: 15, repHigh: 20, notes: "Rear delt and rotator cuff.", inter: "40-60 lbs", adv: "70-90 lbs", weightIncrement: 5 },
      { name: "Cable Curl", sets: 3, repLow: 12, repHigh: 15, notes: "Bicep finisher for the week.", inter: "40-55 lbs", adv: "70-90 lbs", weightIncrement: 5 },
      { name: "Tricep Dip / Pushdown", sets: 3, repLow: 12, repHigh: 15, notes: "Tricep finisher for the week.", inter: "BW / 50-70", adv: "+45 lbs / 90-120", weightIncrement: 5 },
    ]
  },
  {
    day: "Day 7", label: "Rest", focus: "Full Recovery",
    color: "#22c55e", restDay: true,
    restNotes: ["Full rest — no training", "Steps optional", "Focus on sleep quality", "Prep meals for next week"],
    exercises: []
  },
];

export const MACROS = { calories: 2150, protein: 190, carbs: 185, fat: 72 };

export const TABS = ["Today", "Progress", "Macros", "Coach"] as const;
export type TabName = (typeof TABS)[number];

export interface SetLog {
  weight: number;
  reps: number;
}

export interface HistoryEntry {
  date: string;
  sets: SetLog[];
  e1rm: number;
  topWeight: number;
  topReps: number;
}

export function getRecommendation(exercise: Exercise, history: HistoryEntry[]) {
  if (!history || history.length === 0) return null;
  const last = history[history.length - 1];
  if (!last?.sets?.some((s) => s.weight > 0 && s.reps > 0)) return null;
  const allHitTop = last.sets.every((s) => s.reps >= exercise.repHigh);
  const avgReps = last.sets.reduce((a, s) => a + (s.reps || 0), 0) / last.sets.length;
  if (allHitTop) {
    const newW = (last.sets[0]?.weight || 0) + exercise.weightIncrement;
    return { type: "increase" as const, msg: `Hit ${exercise.repHigh} reps all sets → add ${exercise.weightIncrement} lbs (${newW} lbs), drop to ${exercise.repLow} reps` };
  }
  if (avgReps < exercise.repLow) return { type: "decrease" as const, msg: `Avg reps below ${exercise.repLow} — consider dropping weight slightly` };
  return { type: "maintain" as const, msg: `Keep current weight — aim for ${exercise.repHigh} reps on all sets` };
}

export const getE1RM = (weight: number, reps: number) =>
  reps === 1 ? weight : Math.round(weight * (1 + reps / 30));

export const todayISO = () => new Date().toISOString().split("T")[0];

export const fmtDate = (d: string) => {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
