import api from "./api";
import type { Note } from "@/store/notesSlice";

export const noteService = {
  getAll: () => api.get<Note[]>("/notes"),
  getById: (id: number) => api.get<Note>(`/notes/${id}`),
  create: (data: Partial<Note>) => api.post<Note>("/notes", data),
  update: (id: number, data: Partial<Note>) => api.put<Note>(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};
