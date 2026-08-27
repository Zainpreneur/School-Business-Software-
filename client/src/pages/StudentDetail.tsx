import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as studentsApi from "../api/students";
import { Student } from "../types";
import { Badge, Card, CardHeader, Spinner } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    studentsApi
      .getStudent(id)
      .then(setStudent)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!student) return <p className="text-slate-500">Student not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/students" className="text-sm text-brand-600 hover:underline">
            ← Back to Students
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-sm text-slate-500">
            {student.admissionNo} · {student.classSection ? `${student.classSection.schoolClass?.name} - ${student.classSection.name}` : "Unassigned"}
          </p>
        </div>
        <Badge color={student.isActive ? "green" : "slate"}>{student.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Personal Details" />
          <dl className="space-y-2 p-5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Gender</dt><dd className="text-slate-800">{student.gender}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Date of Birth</dt><dd className="text-slate-800">{new Date(student.dob).toLocaleDateString()}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Phone</dt><dd className="text-slate-800">{student.phone || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="text-slate-800">{student.email || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Address</dt><dd className="text-slate-800 text-right">{student.address || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Admission Date</dt><dd className="text-slate-800">{new Date(student.admissionDate).toLocaleDateString()}</dd></div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Guardian" />
          <div className="p-5 text-sm">
            {student.parent ? (
              <div className="space-y-2">
                <p className="font-medium text-slate-800">{student.parent.user.firstName} {student.parent.user.lastName}</p>
                <p className="text-slate-500">{student.parent.user.email}</p>
                <p className="text-slate-500">{student.parent.user.phone || "No phone on file"}</p>
              </div>
            ) : (
              <p className="text-slate-400">No guardian linked yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Fee Summary" />
          <div className="space-y-2 p-5 text-sm">
            {(student.invoices ?? []).length === 0 && <p className="text-slate-400">No invoices yet.</p>}
            {(student.invoices ?? []).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                <div>
                  <p className="font-medium text-slate-700">{inv.invoiceNo}</p>
                  <p className="text-xs text-slate-400">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{formatCurrency(inv.totalAmount)}</p>
                  <Badge color={inv.status === "PAID" ? "green" : inv.status === "OVERDUE" ? "red" : "yellow"}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Exam Results" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Exam</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Marks</th>
                <th className="px-5 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(student.examResults ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                    No results recorded yet.
                  </td>
                </tr>
              )}
              {(student.examResults ?? []).map((r: any) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">{r.examSubject.exam.name}</td>
                  <td className="px-5 py-3">{r.examSubject.subject.name}</td>
                  <td className="px-5 py-3">
                    {r.marksObtained} / {r.examSubject.maxMarks}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color="blue">{r.grade}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
