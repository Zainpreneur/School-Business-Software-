import { api } from "./client";
import { AttendanceStatus, StudentAttendance } from "../types";

export async function markStudentAttendance(
  date: string,
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
) {
  const { data } = await api.post("/attendance/students", { date, records });
  return data.records;
}

export async function getStudentAttendance(query: {
  studentId?: string;
  classSectionId?: string;
  from?: string;
  to?: string;
}) {
  const { data } = await api.get<{ attendance: StudentAttendance[] }>("/attendance/students", { params: query });
  return data.attendance;
}

export async function getStudentAttendanceSummary(studentId: string) {
  const { data } = await api.get<{ summary: { status: AttendanceStatus; count: number }[] }>(
    `/attendance/students/${studentId}/summary`
  );
  return data.summary;
}
