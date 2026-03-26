-- Exercise sessions (workout logs)
CREATE TABLE exercise_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  day_index int NOT NULL,
  exercise_index int NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  sets jsonb NOT NULL DEFAULT '[]',
  top_weight numeric,
  top_reps int,
  e1rm numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_index, exercise_index, date)
);

ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions"
  ON exercise_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Macro logs
CREATE TABLE macro_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  calories numeric DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE macro_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own macros"
  ON macro_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Body logs
CREATE TABLE body_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric,
  waist numeric,
  UNIQUE(user_id, date)
);

ALTER TABLE body_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own body logs"
  ON body_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Coach messages
CREATE TABLE coach_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own messages"
  ON coach_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
