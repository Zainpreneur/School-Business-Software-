import { api } from "./client";
import { ClassSection, SchoolClass, Subject } from "../types";

export async function listClasses() {
  const { data } = await api.get<{ classes: SchoolClass[] }>("/academics/classes");
  return data.classes;
}

export async function createClass(name: string) {
  const { data } = await api.post<{ schoolClass: SchoolClass }>("/academics/classes", { name });
  return data.schoolClass;
}

export async function deleteClass(id: string) {
  await api.delete(`/academics/classes/${id}`);
}

export async function createSection(payload: {
  name: string;
  schoolClassId: string;
  roomNo?: string;
  capacity?: number;
  classTeacherId?: string;
}) {
  const { data } = await api.post<{ section: ClassSection }>("/academics/sections", payload);
  return data.section;
}

export async function getSection(id: string) {
  const { data } = await api.get<{ section: ClassSection }>(`/academics/sections/${id}`);
  return data.section;
}

export async function updateSection(id: string, payload: Partial<ClassSection>) {
  const { data } = await api.patch<{ section: ClassSection }>(`/academics/sections/${id}`, payload);
  return data.section;
}

export async function deleteSection(id: string) {
  await api.delete(`/academics/sections/${id}`);
}

export async function assignSectionSubjects(id: string, subjectIds: string[]) {
  const { data } = await api.put<{ section: ClassSection }>(`/academics/sections/${id}/subjects`, { subjectIds });
  return data.section;
}

export async function listSubjects() {
  const { data } = await api.get<{ subjects: Subject[] }>("/academics/subjects");
  return data.subjects;
}

export async function createSubject(payload: { name: string; code: string }) {
  const { data } = await api.post<{ subject: Subject }>("/academics/subjects", payload);
  return data.subject;
}

export async function deleteSubject(id: string) {
  await api.delete(`/academics/subjects/${id}`);
}
