import { api } from "./client";
import { Exam } from "../types";

export async function listExams(classSectionId?: string) {
  const { data } = await api.get<{ exams: Exam[] }>("/exams", { params: { classSectionId } });
  return data.exams;
}

export async function getExam(id: string) {
  const { data } = await api.get<{ exam: Exam }>(`/exams/${id}`);
  return data.exam;
}

export async function createExam(payload: {
  name: string;
  classSectionId: string;
  startDate: string;
  endDate: string;
  subjects: { subjectId: string; examDate?: string; maxMarks?: number; passMarks?: number }[];
}) {
  const { data } = await api.post<{ exam: Exam }>("/exams", payload);
  return data.exam;
}

export async function deleteExam(id: string) {
  await api.delete(`/exams/${id}`);
}

export async function recordResults(
  examSubjectId: string,
  results: { studentId: string; marksObtained: number; remarks?: string }[]
) {
  const { data } = await api.post(`/exams/subjects/${examSubjectId}/results`, { results });
  return data.results;
}

export interface ReportCard {
  exam: { id: string; name: string };
  student: { id: string; name: string; admissionNo: string };
  subjects: {
    subject: string;
    maxMarks: number;
    passMarks: number;
    marksObtained: number | null;
    grade: string | null;
    passed: boolean | null;
  }[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
}

export async function getReportCard(examId: string, studentId: string) {
  const { data } = await api.get<ReportCard>(`/exams/${examId}/report-card/${studentId}`);
  return data;
}
