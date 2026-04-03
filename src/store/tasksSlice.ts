import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: number;
  title: string;
  body: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  projectId: number | null;
}

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
    addTask(state, action: PayloadAction<Task>) {
      state.items.push(action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeTask(state, action: PayloadAction<number>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setTasks, addTask, updateTask, removeTask, setLoading, setError } =
  tasksSlice.actions;
export default tasksSlice.reducer;
