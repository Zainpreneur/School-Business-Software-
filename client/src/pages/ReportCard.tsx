import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as examsApi from "../api/exams";
import { Badge, Card, Spinner } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

export default function ReportCard() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();
  const [report, setReport] = useState<examsApi.ReportCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !studentId) return;
    examsApi
      .getReportCard(examId, studentId)
      .then(setReport)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [examId, studentId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!report) return <p className="text-slate-500">Report card not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to={`/exams/${examId}`} className="text-sm text-brand-600 hover:underline">
        ← Back to Exam
      </Link>

      <Card className="p-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400">Report Card</p>
          <h1 className="text-2xl font-bold text-slate-800">{report.exam.name}</h1>
        </div>

        <div className="mb-6 flex justify-between text-sm">
          <div>
            <p className="text-slate-400">Student</p>
            <p className="font-medium text-slate-800">{report.student.name}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Admission No</p>
            <p className="font-medium text-slate-800">{report.student.admissionNo}</p>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
            <tr>
              <th className="py-2">Subject</th>
              <th className="py-2">Marks</th>
              <th className="py-2">Grade</th>
              <th className="py-2">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.subjects.map((s) => (
              <tr key={s.subject}>
                <td className="py-2 font-medium text-slate-700">{s.subject}</td>
                <td className="py-2">
                  {s.marksObtained ?? "—"} / {s.maxMarks}
                </td>
                <td className="py-2">{s.grade ? <Badge color="blue">{s.grade}</Badge> : "—"}</td>
                <td className="py-2">
                  {s.passed === null ? (
                    "—"
                  ) : s.passed ? (
                    <Badge color="green">Pass</Badge>
                  ) : (
                    <Badge color="red">Fail</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4 text-center">
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="font-semibold text-slate-800">
              {report.totalObtained} / {report.totalMax}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Percentage</p>
            <p className="font-semibold text-slate-800">{report.percentage}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Overall Grade</p>
            <p className="font-semibold text-slate-800">{report.overallGrade}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
