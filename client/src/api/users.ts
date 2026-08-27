import { api } from "./client";
import { Paginated, Parent, User } from "../types";

export async function listUsers(query: { page?: number; limit?: number; role?: string; search?: string } = {}) {
  const { data } = await api.get<Paginated<User>>("/users", { params: query });
  return data;
}

export async function updateUserStatus(id: string, isActive: boolean) {
  const { data } = await api.patch<{ user: User }>(`/users/${id}/status`, { isActive });
  return data.user;
}

export async function listParents(query: { page?: number; limit?: number } = {}) {
  const { data } = await api.get<Paginated<Parent>>("/users/parents", { params: query });
  return data;
}

export async function createParent(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}) {
  const { data } = await api.post<{ parent: Parent }>("/users/parents", payload);
  return data.parent;
}
