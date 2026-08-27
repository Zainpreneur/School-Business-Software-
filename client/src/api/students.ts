import { api } from "./client";
import { Paginated, Student } from "../types";

export interface StudentQuery {
  page?: number;
  limit?: number;
  search?: string;
  classSectionId?: string;
  isActive?: boolean;
}

export async function listStudents(query: StudentQuery = {}) {
  const { data } = await api.get<Paginated<Student>>("/students", { params: query });
  return data;
}

export async function getStudent(id: string) {
  const { data } = await api.get<{ student: Student }>(`/students/${id}`);
  return data.student;
}

export async function createStudent(payload: Partial<Student>) {
  const { data } = await api.post<{ student: Student }>("/students", payload);
  return data.student;
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  const { data } = await api.patch<{ student: Student }>(`/students/${id}`, payload);
  return data.student;
}

export async function deleteStudent(id: string) {
  await api.delete(`/students/${id}`);
}
