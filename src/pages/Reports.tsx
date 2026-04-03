import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGitHubData } from "@/store/githubSlice";
import type { WeeklyReport, DailyStats } from "@/types";
import { useNavigate } from "react-router-dom";

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getWeekStats(weekStart: string, dailyStats: DailyStats[]) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const days = dailyStats.filter((d) => {
    const date = new Date(d.date);
    return date >= start && date <= end;
  });

  return {
    commits: days.reduce((s, d) => s + d.commits, 0),
    prs: days.reduce((s, d) => s + d.prsOpened + d.prsMerged, 0),
    lines: days.reduce((s, d) => s + d.linesChanged, 0),
  };
}

function ReportCard({
  report,
  dailyStats,
  onClick,
}: {
  report: WeeklyReport;
  dailyStats: DailyStats[];
  onClick: () => void;
}) {
  const weekStats = useMemo(() => getWeekStats(report.weekStart, dailyStats), [report.weekStart, dailyStats]);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-800 bg-gray-900 p-6 text-left transition-colors hover:border-gray-700 hover:bg-gray-900/80"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-400">
          {formatWeekRange(report.weekStart)}
        </h3>
        <svg
          className="h-4 w-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-300">{report.summary}</p>

      {/* Mini stats */}
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
          <span className="text-gray-400">{weekStats.commits}</span> commits
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span className="text-gray-400">{weekStats.prs}</span> PRs
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          <span className="text-gray-400">{weekStats.lines.toLocaleString()}</span> lines
        </div>
      </div>

      {/* Highlights badges */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {report.highlights.slice(0, 3).map((h, i) => (
          <span
            key={i}
            className="inline-block max-w-[200px] truncate rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400"
          >
            {h}
          </span>
        ))}
        {report.highlights.length > 3 && (
          <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-500">
            +{report.highlights.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

function ReportDetail({
  report,
  dailyStats,
  onBack,
}: {
  report: WeeklyReport;
  dailyStats: DailyStats[];
  onBack: () => void;
}) {
  const weekStats = useMemo(() => getWeekStats(report.weekStart, dailyStats), [report.weekStart, dailyStats]);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to Reports
      </button>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8">
        <h2 className="text-2xl font-bold text-white">
          {formatWeekRange(report.weekStart)}
        </h2>

        {/* Stats row */}
        <div className="mt-6 flex gap-6">
          <div className="rounded-lg bg-gray-800/50 px-4 py-3">
            <p className="text-2xl font-bold text-white">{weekStats.commits}</p>
            <p className="text-xs text-gray-500">Commits</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 px-4 py-3">
            <p className="text-2xl font-bold text-white">{weekStats.prs}</p>
            <p className="text-xs text-gray-500">PRs</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 px-4 py-3">
            <p className="text-2xl font-bold text-white">{weekStats.lines.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Lines Changed</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Summary
          </h3>
          <p className="mt-2 leading-relaxed text-gray-300">{report.summary}</p>
        </div>

        {/* Highlights */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Highlights
          </h3>
          <ul className="mt-3 space-y-2">
            {report.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { weeklyReports, dailyStats, loading, error, configured } = useAppSelector((s) => s.github);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (configured && weeklyReports.length === 0 && !loading) {
      dispatch(fetchGitHubData());
    }
  }, [configured, weeklyReports.length, loading, dispatch]);

  if (!configured) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Weekly Reports</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <p className="text-sm text-gray-400">Connect GitHub in Settings to see reports.</p>
          <button
            onClick={() => navigate("/settings")}
            className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  if (loading && weeklyReports.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Weekly Reports</h1>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Weekly Reports</h1>
        <div className="rounded-xl border border-red-800 bg-red-900/20 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
        <button
          onClick={() => dispatch(fetchGitHubData())}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (selectedIndex !== null) {
    return (
      <ReportDetail
        report={weeklyReports[selectedIndex]}
        dailyStats={dailyStats}
        onBack={() => setSelectedIndex(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Weekly Reports</h1>
      {weeklyReports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports available yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {weeklyReports.map((report, i) => (
            <ReportCard
              key={report.weekStart}
              report={report}
              dailyStats={dailyStats}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
