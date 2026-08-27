import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { getOverview, getFinanceTrends, DashboardOverview, FinanceTrendPoint } from "../api/dashboard";
import { Card, CardHeader, Spinner } from "../components/ui";

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num || 0);
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent}`}>{icon}</div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<FinanceTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ov, tr] = await Promise.all([getOverview(), getFinanceTrends()]);
        setOverview(ov);
        setTrends(tr);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!overview) return null;

  const attendanceMap = Object.fromEntries(overview.attendanceToday.map((a) => [a.status, a.count]));
  const chartData = trends.map((t) => ({
    month: t.month,
    Revenue: typeof t.revenue === "string" ? parseFloat(t.revenue) : t.revenue,
    Expenses: typeof t.expenses === "string" ? parseFloat(t.expenses) : t.expenses,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your school's operations and finances</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={`${overview.students.total}`} icon="🎓" accent="bg-blue-100" />
        <StatCard label="Active Students" value={`${overview.students.active}`} icon="✅" accent="bg-emerald-100" />
        <StatCard label="Teachers" value={`${overview.teachers.total}`} icon="🧑‍🏫" accent="bg-purple-100" />
        <StatCard label="Classes" value={`${overview.classes.total}`} icon="🏫" accent="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (This Month)" value={formatCurrency(overview.finance.monthlyRevenue)} icon="💰" accent="bg-emerald-100" />
        <StatCard label="Expenses (This Month)" value={formatCurrency(overview.finance.monthlyExpenses)} icon="💸" accent="bg-red-100" />
        <StatCard label="Outstanding Dues" value={formatCurrency(overview.finance.outstandingDues)} icon="📄" accent="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue vs Expenses" subtitle="Last 6 months" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Today's Attendance" />
          <div className="space-y-3 p-5">
            {(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"] as const).map((status) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{status.replace("_", " ")}</span>
                <span className="font-semibold text-slate-800">{attendanceMap[status] ?? 0}</span>
              </div>
            ))}
            {overview.attendanceToday.length === 0 && (
              <p className="text-sm text-slate-400">No attendance recorded yet today.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Announcements" />
        <div className="divide-y divide-slate-100">
          {overview.recentAnnouncements.length === 0 && <p className="p-5 text-sm text-slate-400">No announcements yet.</p>}
          {overview.recentAnnouncements.map((a) => (
            <div key={a.id} className="p-5">
              <p className="font-medium text-slate-800">{a.title}</p>
              <p className="text-sm text-slate-500">{a.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
