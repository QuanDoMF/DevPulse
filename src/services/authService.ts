import api from "./api";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthResponse {
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data.user;
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>("/auth/register", { email, password, name });
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthResponse>("/auth/me");
  return data.user;
}

export async function refreshToken(): Promise<AuthUser> {
  const { data } = await api.post<AuthResponse>("/auth/refresh");
  return data.user;
}
