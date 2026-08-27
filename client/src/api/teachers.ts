import { api } from "./client";
import { Paginated, Teacher } from "../types";

export async function listTeachers(query: { page?: number; limit?: number; search?: string } = {}) {
  const { data } = await api.get<Paginated<Teacher>>("/teachers", { params: query });
  return data;
}

export async function getTeacher(id: string) {
  const { data } = await api.get<{ teacher: Teacher }>(`/teachers/${id}`);
  return data.teacher;
}

export async function createTeacher(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  qualification?: string;
  salary?: number;
  address?: string;
  subjectIds?: string[];
}) {
  const { data } = await api.post<{ teacher: Teacher }>("/teachers", payload);
  return data.teacher;
}

export async function updateTeacher(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<{ teacher: Teacher }>(`/teachers/${id}`, payload);
  return data.teacher;
}

export async function deleteTeacher(id: string) {
  await api.delete(`/teachers/${id}`);
}
