import { mockDailyStats } from "@/mocks/data";

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

  // Current streak: consecutive days with commits > 0 from most recent
  let streak = 0;
  for (const day of thisWeek) {
    if (day.commits > 0) streak++;
    else break;
  }

  // Last week streak for comparison
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

export function Dashboard() {
  const stats = computeStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
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
    </div>
  );
}
