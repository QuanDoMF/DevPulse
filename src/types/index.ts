export interface GitActivity {
  id: number;
  type: "commit" | "pr_opened" | "pr_merged" | "pr_closed" | "review" | "issue";
  repo: string;
  message: string;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  linesChanged: number;
}

export interface WeeklyReport {
  weekStart: string;
  summary: string;
  highlights: string[];
}
