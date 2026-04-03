import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  repoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface ProjectsState {
  items: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.items = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.items.push(action.payload);
    },
    updateProject(state, action: PayloadAction<Project>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeProject(state, action: PayloadAction<number>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setProjects, addProject, updateProject, removeProject, setLoading, setError } =
  projectsSlice.actions;
export default projectsSlice.reducer;
