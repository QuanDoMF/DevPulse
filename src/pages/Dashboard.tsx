import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockDailyStats, mockGitActivities } from "@/mocks/data";
import type { GitActivity } from "@/types";

// --- StatsCard ---

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
}

function StatsCard({ icon, label, value, change }: StatsCardProps) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
        <span
          className={`text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}

// --- CommitsChart ---

function CommitsChart() {
  const chartData = [...mockDailyStats].reverse().map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    commits: d.commits,
  }));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Commits (Last 14 Days)</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Bar dataKey="commits" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- ActivityFeed ---

function timeAgo(timestamp: string): string {
  const now = new Date("2026-04-03T12:00:00Z");
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function activityIcon(type: GitActivity["type"]) {
  switch (type) {
    case "commit":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </div>
      );
    case "pr_opened":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      );
    case "pr_merged":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>
      );
    case "pr_closed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case "review":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
      );
    case "issue":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
      );
  }
}

function ActivityFeed() {
  const recentActivities = mockGitActivities.slice(0, 10);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            {activityIcon(activity.type)}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{activity.message}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">
                  {activity.repo}
                </span>
                <span>{timeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Stats computation ---

function computeStats() {
  const thisWeek = mockDailyStats.slice(0, 7);
  const lastWeek = mockDailyStats.slice(7, 14);

  const sum = (data: typeof mockDailyStats, key: keyof (typeof mockDailyStats)[0]) =>
    data.reduce((acc, d) => acc + (d[key] as number), 0);

  const thisCommits = sum(thisWeek, "commits");
  const lastCommits = sum(lastWeek, "commits");
  const thisMerged = sum(thisWeek, "prsMerged");
  const lastMerged = sum(lastWeek, "prsMerged");
  const thisLines = sum(thisWeek, "linesChanged");
  const lastLines = sum(lastWeek, "linesChanged");

  const pct = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  let streak = 0;
  for (const day of thisWeek) {
    if (day.commits > 0) streak++;
    else break;
  }

  let lastStreak = 0;
  for (const day of lastWeek) {
    if (day.commits > 0) lastStreak++;
    else break;
  }

  return {
    commits: { value: thisCommits, change: pct(thisCommits, lastCommits) },
    merged: { value: thisMerged, change: pct(thisMerged, lastMerged) },
    lines: {
      value: thisLines.toLocaleString(),
      change: pct(thisLines, lastLines),
    },
    streak: { value: `${streak}d`, change: pct(streak, lastStreak) },
  };
}

// --- Dashboard ---

export function Dashboard() {
  const stats = computeStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          }
          label="Total Commits"
          value={stats.commits.value}
          change={stats.commits.change}
        />
        <StatsCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
          label="PRs Merged"
          value={stats.merged.value}
          change={stats.merged.change}
        />
        <StatsCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          }
          label="Lines Changed"
          value={stats.lines.value}
          change={stats.lines.change}
        />
        <StatsCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
            </svg>
          }
          label="Current Streak"
          value={stats.streak.value}
          change={stats.streak.change}
        />
      </div>

      {/* Chart + Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommitsChart />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
