import { api } from "./client";
import { User } from "../types";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: User; accessToken: string }>("/auth/login", { email, password });
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function fetchMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function refresh() {
  const { data } = await api.post<{ user: User; accessToken: string }>("/auth/refresh");
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}

export async function registerUser(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}
