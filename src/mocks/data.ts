import { GitActivity, DailyStats, WeeklyReport } from "@/types";

export const mockGitActivities: GitActivity[] = [
  // Week 2 (Mar 30 – Apr 3)
  {
    id: 1,
    type: "commit",
    repo: "DevPulse",
    message: "feat: add sidebar layout with navigation",
    timestamp: "2026-04-03T09:15:00Z",
  },
  {
    id: 2,
    type: "pr_opened",
    repo: "DevPulse",
    message: "feat: implement dashboard stats cards",
    timestamp: "2026-04-03T08:30:00Z",
  },
  {
    id: 3,
    type: "commit",
    repo: "DevPulse",
    message: "chore: configure ESLint and Prettier",
    timestamp: "2026-04-02T16:45:00Z",
  },
  {
    id: 4,
    type: "pr_merged",
    repo: "DevPulse",
    message: "feat: add Redux store with typed hooks",
    timestamp: "2026-04-02T14:20:00Z",
  },
  {
    id: 5,
    type: "review",
    repo: "api-gateway",
    message: "review: validate JWT expiry edge case",
    timestamp: "2026-04-02T11:00:00Z",
  },
  {
    id: 6,
    type: "commit",
    repo: "DevPulse",
    message: "feat: scaffold Prisma schema with 4 models",
    timestamp: "2026-04-01T17:30:00Z",
  },
  {
    id: 7,
    type: "issue",
    repo: "api-gateway",
    message: "bug: token refresh loop on slow connections",
    timestamp: "2026-04-01T10:15:00Z",
  },
  {
    id: 8,
    type: "commit",
    repo: "DevPulse",
    message: "chore: init Vite + React 19 + Tailwind project",
    timestamp: "2026-03-31T15:00:00Z",
  },
  {
    id: 9,
    type: "pr_opened",
    repo: "api-gateway",
    message: "fix: handle expired refresh tokens gracefully",
    timestamp: "2026-03-31T11:30:00Z",
  },
  {
    id: 10,
    type: "commit",
    repo: "blog-platform",
    message: "feat: add markdown preview with syntax highlight",
    timestamp: "2026-03-30T20:00:00Z",
  },

  // Week 1 (Mar 23 – Mar 29)
  {
    id: 11,
    type: "pr_merged",
    repo: "blog-platform",
    message: "feat: implement tag-based filtering",
    timestamp: "2026-03-29T16:00:00Z",
  },
  {
    id: 12,
    type: "commit",
    repo: "blog-platform",
    message: "refactor: extract editor toolbar component",
    timestamp: "2026-03-29T10:30:00Z",
  },
  {
    id: 13,
    type: "review",
    repo: "api-gateway",
    message: "review: rate limiter middleware implementation",
    timestamp: "2026-03-28T14:45:00Z",
  },
  {
    id: 14,
    type: "commit",
    repo: "api-gateway",
    message: "feat: add per-route rate limiting config",
    timestamp: "2026-03-28T09:20:00Z",
  },
  {
    id: 15,
    type: "pr_opened",
    repo: "blog-platform",
    message: "feat: add reading time estimation",
    timestamp: "2026-03-27T18:00:00Z",
  },
  {
    id: 16,
    type: "issue",
    repo: "blog-platform",
    message: "bug: image upload fails for files > 5MB",
    timestamp: "2026-03-27T11:15:00Z",
  },
  {
    id: 17,
    type: "commit",
    repo: "blog-platform",
    message: "fix: resize images before upload to S3",
    timestamp: "2026-03-26T16:30:00Z",
  },
  {
    id: 18,
    type: "pr_merged",
    repo: "api-gateway",
    message: "feat: add health check endpoint with DB ping",
    timestamp: "2026-03-26T10:00:00Z",
  },
  {
    id: 19,
    type: "commit",
    repo: "api-gateway",
    message: "test: add integration tests for auth flow",
    timestamp: "2026-03-25T14:20:00Z",
  },
  {
    id: 20,
    type: "commit",
    repo: "blog-platform",
    message: "feat: draft auto-save every 30 seconds",
    timestamp: "2026-03-24T19:45:00Z",
  },
  {
    id: 21,
    type: "pr_opened",
    repo: "api-gateway",
    message: "feat: implement health check endpoint",
    timestamp: "2026-03-24T09:00:00Z",
  },
  {
    id: 22,
    type: "commit",
    repo: "blog-platform",
    message: "chore: setup Prisma with PostgreSQL",
    timestamp: "2026-03-23T15:30:00Z",
  },
];

export const mockDailyStats: DailyStats[] = [
  // Week 2
  { date: "2026-04-03", commits: 4, prsOpened: 1, prsMerged: 0, linesChanged: 320 },
  { date: "2026-04-02", commits: 3, prsOpened: 0, prsMerged: 1, linesChanged: 485 },
  { date: "2026-04-01", commits: 2, prsOpened: 0, prsMerged: 0, linesChanged: 210 },
  { date: "2026-03-31", commits: 3, prsOpened: 1, prsMerged: 0, linesChanged: 560 },
  { date: "2026-03-30", commits: 1, prsOpened: 0, prsMerged: 0, linesChanged: 145 },
  { date: "2026-03-29", commits: 2, prsOpened: 0, prsMerged: 1, linesChanged: 390 },
  { date: "2026-03-28", commits: 2, prsOpened: 0, prsMerged: 0, linesChanged: 275 },
  // Week 1
  { date: "2026-03-27", commits: 1, prsOpened: 1, prsMerged: 0, linesChanged: 180 },
  { date: "2026-03-26", commits: 2, prsOpened: 0, prsMerged: 1, linesChanged: 350 },
  { date: "2026-03-25", commits: 1, prsOpened: 0, prsMerged: 0, linesChanged: 420 },
  { date: "2026-03-24", commits: 2, prsOpened: 1, prsMerged: 0, linesChanged: 290 },
  { date: "2026-03-23", commits: 1, prsOpened: 0, prsMerged: 0, linesChanged: 195 },
  { date: "2026-03-22", commits: 0, prsOpened: 0, prsMerged: 0, linesChanged: 0 },
  { date: "2026-03-21", commits: 0, prsOpened: 0, prsMerged: 0, linesChanged: 0 },
];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    weekStart: "2026-03-30",
    summary:
      "Kicked off DevPulse project — scaffolded the full stack with Vite, React 19, Tailwind, Prisma, and Redux. Also reviewed and contributed fixes to the api-gateway auth flow.",
    highlights: [
      "Initialized DevPulse repo with complete project structure",
      "Created Prisma schema with User, Project, Task, Note models",
      "Set up Redux store with typed hooks and 3 feature slices",
      "Built sidebar layout with React Router navigation",
      "Reviewed JWT expiry edge case in api-gateway",
    ],
  },
  {
    weekStart: "2026-03-23",
    summary:
      "Focused on blog-platform features (tag filtering, auto-save, image upload fix) and added health check + rate limiting to api-gateway. Solid week across both projects.",
    highlights: [
      "Merged tag-based filtering for blog posts",
      "Fixed image upload failure for large files with client-side resize",
      "Implemented draft auto-save every 30 seconds",
      "Added per-route rate limiting to api-gateway",
      "Merged health check endpoint with DB connectivity ping",
    ],
  },
];
