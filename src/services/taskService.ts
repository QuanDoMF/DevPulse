import api from "./api";
import type { Task } from "@/store/tasksSlice";

export const taskService = {
  getAll: () => api.get<Task[]>("/tasks"),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<Task>("/tasks", data),
  update: (id: number, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
