import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { GitActivity, DailyStats, WeeklyReport } from "@/types";
import {
  getRepoConfig,
  getTokenStatus,
  fetchActivities,
  fetchDailyStats,
  buildWeeklyReports,
} from "@/services/githubService";

interface GitHubState {
  activities: GitActivity[];
  dailyStats: DailyStats[];
  weeklyReports: WeeklyReport[];
  loading: boolean;
  error: string | null;
  configured: boolean;
}

const initialState: GitHubState = {
  activities: [],
  dailyStats: [],
  weeklyReports: [],
  loading: false,
  error: null,
  configured: false,
};

export const fetchGitHubData = createAsyncThunk(
  "github/fetchData",
  async (_, { rejectWithValue }) => {
    const repoConfig = getRepoConfig();
    if (!repoConfig) {
      return rejectWithValue("Repository not configured. Go to Settings.");
    }

    const tokenReady = await getTokenStatus();
    if (!tokenReady) {
      return rejectWithValue("GitHub token not configured. Go to Settings.");
    }

    const [activities, dailyStats] = await Promise.all([
      fetchActivities(repoConfig.owner, repoConfig.repo),
      fetchDailyStats(repoConfig.owner, repoConfig.repo),
    ]);

    const weeklyReports = buildWeeklyReports(dailyStats, activities);

    return { activities, dailyStats, weeklyReports };
  },
);

const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {
    markConfigured(state) {
      state.configured = true;
    },
    clearGitHubData(state) {
      state.activities = [];
      state.dailyStats = [];
      state.weeklyReports = [];
      state.error = null;
      state.configured = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubData.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.dailyStats = action.payload.dailyStats;
        state.weeklyReports = action.payload.weeklyReports;
        state.configured = true;
      })
      .addCase(fetchGitHubData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || "Failed to fetch data";
      });
  },
});

export const { markConfigured, clearGitHubData } = githubSlice.actions;
export default githubSlice.reducer;
