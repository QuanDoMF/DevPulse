import { configureStore } from "@reduxjs/toolkit";
import projectsReducer from "./projectsSlice";
import tasksReducer from "./tasksSlice";
import notesReducer from "./notesSlice";

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks: tasksReducer,
    notes: notesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
