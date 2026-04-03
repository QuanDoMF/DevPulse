import api from "./api";
import type { Project } from "@/store/projectsSlice";

export const projectService = {
  getAll: () => api.get<Project[]>("/projects"),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>("/projects", data),
  update: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};
