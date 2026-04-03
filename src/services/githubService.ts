import api from "./api";
import type { GitActivity, DailyStats, WeeklyReport } from "@/types";

// --- GitHub token management (server-side encrypted) ---

export async function saveGitHubToken(token: string): Promise<void> {
  await api.put("/github/token", { token });
}

export async function getTokenStatus(): Promise<boolean> {
  const { data } = await api.get<{ configured: boolean }>("/github/token/status");
  return data.configured;
}

export async function deleteGitHubToken(): Promise<void> {
  await api.delete("/github/token");
}

// --- Repo config (non-sensitive, stored in localStorage) ---

const REPO_STORAGE_KEY = "devpulse_github_repo";

export interface RepoConfig {
  owner: string;
  repo: string;
}

export function getRepoConfig(): RepoConfig | null {
  const raw = localStorage.getItem(REPO_STORAGE_KEY);
  if (!raw) return null;
  try {
    const config = JSON.parse(raw) as RepoConfig;
    if (!config.owner || !config.repo) return null;
    return config;
  } catch {
    return null;
  }
}

export function saveRepoConfig(config: RepoConfig): void {
  localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(config));
}

// --- Fetch via server proxy ---

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    pull_request?: { merged?: boolean; title?: string };
    commits?: { message: string }[];
    review?: { body?: string };
    issue?: { title?: string };
  };
}

function mapEventToActivity(event: GitHubEvent, index: number): GitActivity | null {
  const repo = event.repo.name.split("/").pop() || event.repo.name;
  const timestamp = event.created_at;

  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload.commits || [];
      const message = commits.length > 0 ? commits[0].message : "Push event";
      return { id: index, type: "commit", repo, message, timestamp };
    }
    case "PullRequestEvent": {
      const pr = event.payload.pull_request;
      const title = pr?.title || "Pull request";
      if (event.payload.action === "opened") {
        return { id: index, type: "pr_opened", repo, message: title, timestamp };
      }
      if (event.payload.action === "closed" && pr?.merged) {
        return { id: index, type: "pr_merged", repo, message: title, timestamp };
      }
      if (event.payload.action === "closed") {
        return { id: index, type: "pr_closed", repo, message: title, timestamp };
      }
      return null;
    }
    case "PullRequestReviewEvent": {
      const body = event.payload.review?.body || "Code review";
      return { id: index, type: "review", repo, message: body, timestamp };
    }
    case "IssuesEvent": {
      const title = event.payload.issue?.title || "Issue";
      if (event.payload.action === "opened" || event.payload.action === "closed") {
        return { id: index, type: "issue", repo, message: title, timestamp };
      }
      return null;
    }
    default:
      return null;
  }
}

export async function fetchActivities(owner: string, repo: string): Promise<GitActivity[]> {
  const { data } = await api.get<GitHubEvent[]>(
    `/github/proxy/repos/${owner}/${repo}/events`,
    { params: { per_page: 100 } },
  );
  return data
    .map((e, i) => mapEventToActivity(e, i + 1))
    .filter((a): a is GitActivity => a !== null);
}

// --- Fetch commits and build DailyStats[] ---

interface GitHubCommit {
  sha: string;
  commit: { message: string; author: { date: string } };
  stats?: { additions: number; deletions: number; total: number };
}

interface GitHubPull {
  id: number;
  state: string;
  merged_at: string | null;
  created_at: string;
}

export async function fetchDailyStats(owner: string, repo: string): Promise<DailyStats[]> {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [commitsRes, pullsRes] = await Promise.all([
    api.get<GitHubCommit[]>(`/github/proxy/repos/${owner}/${repo}/commits`, {
      params: { since: since.toISOString(), per_page: 100 },
    }),
    api.get<GitHubPull[]>(`/github/proxy/repos/${owner}/${repo}/pulls`, {
      params: { state: "all", sort: "created", direction: "desc", per_page: 100 },
    }),
  ]);

  const statsMap = new Map<string, DailyStats>();
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    statsMap.set(key, { date: key, commits: 0, prsOpened: 0, prsMerged: 0, linesChanged: 0 });
  }

  for (const c of commitsRes.data) {
    const date = c.commit.author.date.slice(0, 10);
    const entry = statsMap.get(date);
    if (entry) {
      entry.commits++;
      entry.linesChanged += c.stats?.total || 0;
    }
  }

  // Fetch line stats for commits missing them
  const needsStats = commitsRes.data.filter((c) => !c.stats);
  if (needsStats.length > 0 && needsStats.length <= 30) {
    const details = await Promise.all(
      needsStats.slice(0, 30).map((c) =>
        api
          .get<GitHubCommit>(`/github/proxy/repos/${owner}/${repo}/commits/${c.sha}`)
          .then((r) => r.data)
          .catch(() => null),
      ),
    );
    for (const detail of details) {
      if (!detail?.stats) continue;
      const date = detail.commit.author.date.slice(0, 10);
      const entry = statsMap.get(date);
      if (entry) entry.linesChanged += detail.stats.total;
    }
  }

  for (const pr of pullsRes.data) {
    const openedDate = pr.created_at.slice(0, 10);
    const openedEntry = statsMap.get(openedDate);
    if (openedEntry) openedEntry.prsOpened++;

    if (pr.merged_at) {
      const mergedDate = pr.merged_at.slice(0, 10);
      const mergedEntry = statsMap.get(mergedDate);
      if (mergedEntry) mergedEntry.prsMerged++;
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// --- Build weekly reports ---

export function buildWeeklyReports(
  dailyStats: DailyStats[],
  activities: GitActivity[],
): WeeklyReport[] {
  if (dailyStats.length === 0) return [];

  const thisWeek = dailyStats.slice(0, 7);
  const lastWeek = dailyStats.slice(7, 14);

  function buildReport(days: DailyStats[]): WeeklyReport | null {
    if (days.length === 0) return null;
    const weekStart = days[days.length - 1].date;
    const totalCommits = days.reduce((s, d) => s + d.commits, 0);
    const totalPRs = days.reduce((s, d) => s + d.prsOpened + d.prsMerged, 0);
    const totalLines = days.reduce((s, d) => s + d.linesChanged, 0);

    const startDate = days[days.length - 1].date;
    const endDate = days[0].date;
    const weekActivities = activities.filter((a) => {
      const date = a.timestamp.slice(0, 10);
      return date >= startDate && date <= endDate;
    });

    const highlights = weekActivities.slice(0, 5).map((a) => a.message);
    if (highlights.length === 0) {
      highlights.push(
        `${totalCommits} commits, ${totalPRs} PRs, ${totalLines.toLocaleString()} lines changed`,
      );
    }

    const summary = `${totalCommits} commits across the week with ${totalPRs} pull requests and ${totalLines.toLocaleString()} lines changed.`;
    return { weekStart, summary, highlights };
  }

  return [buildReport(thisWeek), buildReport(lastWeek)].filter(
    (r): r is WeeklyReport => r !== null,
  );
}
