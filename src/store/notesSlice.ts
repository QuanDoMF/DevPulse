import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface NotesState {
  items: Note[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  items: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes(state, action: PayloadAction<Note[]>) {
      state.items = action.payload;
    },
    addNote(state, action: PayloadAction<Note>) {
      state.items.push(action.payload);
    },
    updateNote(state, action: PayloadAction<Note>) {
      const idx = state.items.findIndex((n) => n.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeNote(state, action: PayloadAction<number>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setNotes, addNote, updateNote, removeNote, setLoading, setError } =
  notesSlice.actions;
export default notesSlice.reducer;
