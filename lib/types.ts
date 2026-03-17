// ──────────────────────────────────────────────
// Database types (mirrors Supabase schema)
// ──────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
};

// ── Finance ──────────────────────────────────

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // "YYYY-MM"
  created_at: string;
};

export type FinancialGoal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  is_percent?: boolean;
  created_at: string;
};

export type Asset = {
  id: string;
  user_id: string;
  name: string;
  category: "유동자산" | "투자자산" | "고정자산";
  amount: number;
  updated_at: string;
};

export type Liability = {
  id: string;
  user_id: string;
  name: string;
  category: "유동부채" | "장기부채";
  amount: number;
  updated_at: string;
};

// ── Self-Development ──────────────────────────

export type Routine = {
  id: string;
  user_id: string;
  title: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

export type RoutineLog = {
  id: string;
  user_id: string;
  routine_id: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  created_at: string;
};

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  total_pages: number;
  read_pages: number;
  status: "todo" | "reading" | "done";
  started_at?: string;
  finished_at?: string;
  created_at: string;
};

export type HealthLog = {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  sleep_hours?: number;
  exercise_done: boolean;
  memo?: string;
  created_at: string;
};

export type StudyProgress = {
  id: string;
  user_id: string;
  subject: string;
  progress: number; // 0-100
  updated_at: string;
};

// ── Community ─────────────────────────────────

export type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tag: string;
  likes: number;
  created_at: string;
  profiles?: Pick<Profile, "name" | "avatar_url">;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, "name" | "avatar_url">;
};

// ── Chart / UI helpers ────────────────────────

export type MonthlyStats = {
  month: string;
  income: number;
  expense: number;
  save: number;
};

export type CategoryStats = {
  name: string;
  value: number;
};
