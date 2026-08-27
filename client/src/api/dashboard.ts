import { api } from "./client";
import { Announcement, AttendanceStatus } from "../types";

export interface DashboardOverview {
  students: { total: number; active: number };
  teachers: { total: number };
  classes: { total: number };
  attendanceToday: { status: AttendanceStatus; count: number }[];
  finance: {
    monthlyRevenue: number | string;
    monthlyExpenses: number | string;
    outstandingDues: number | string;
  };
  recentAnnouncements: Announcement[];
}

export async function getOverview() {
  const { data } = await api.get<DashboardOverview>("/dashboard/overview");
  return data;
}

export interface FinanceTrendPoint {
  month: string;
  revenue: number | string;
  expenses: number | string;
}

export async function getFinanceTrends() {
  const { data } = await api.get<{ trends: FinanceTrendPoint[] }>("/dashboard/finance-trends");
  return data.trends;
}
