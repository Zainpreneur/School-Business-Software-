import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as examsApi from "../api/exams";
import { Exam } from "../types";
import { Button, Card, CardHeader, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<Record<string, Record<string, string>>>({});
  const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await examsApi.getExam(id);
      setExam(data);
      const initial: Record<string, Record<string, string>> = {};
      data.subjects.forEach((es) => {
        initial[es.id] = {};
        (es.results ?? []).forEach((r) => {
          initial[es.id][r.studentId] = String(r.marksObtained);
        });
      });
      setMarks(initial);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const students = (exam?.classSection as any)?.students ?? [];

  const handleSaveSubject = async (examSubjectId: string) => {
    setSavingSubjectId(examSubjectId);
    try {
      const results = students.map((s: any) => ({
        studentId: s.id,
        marksObtained: Number(marks[examSubjectId]?.[s.id] ?? 0),
      }));
      await examsApi.recordResults(examSubjectId, results);
      toast.success("Results saved");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingSubjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!exam) return <p className="text-slate-500">Exam not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/exams" className="text-sm text-brand-600 hover:underline">
          ← Back to Exams
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">{exam.name}</h1>
        <p className="text-sm text-slate-500">
          {exam.classSection?.schoolClass?.name} - {exam.classSection?.name}
        </p>
      </div>

      {exam.subjects.map((es) => (
        <Card key={es.id}>
          <CardHeader
            title={es.subject.name}
            subtitle={`Max marks: ${es.maxMarks} · Pass marks: ${es.passMarks}`}
            action={
              <Button onClick={() => handleSaveSubject(es.id)} disabled={savingSubjectId === es.id}>
                {savingSubjectId === es.id ? "Saving..." : "Save Marks"}
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Admission No</th>
                  <th className="px-5 py-3">Marks Obtained</th>
                  <th className="px-5 py-3">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                      No students in this section.
                    </td>
                  </tr>
                )}
                {students.map((s: any) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{s.admissionNo}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        max={es.maxMarks}
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                        value={marks[es.id]?.[s.id] ?? ""}
                        onChange={(e) =>
                          setMarks({
                            ...marks,
                            [es.id]: { ...marks[es.id], [s.id]: e.target.value },
                          })
                        }
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/exams/${exam.id}/report-card/${s.id}`} className="text-brand-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
