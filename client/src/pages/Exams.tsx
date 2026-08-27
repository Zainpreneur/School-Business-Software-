import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import * as examsApi from "../api/exams";
import * as academicsApi from "../api/academics";
import { Exam, SchoolClass, Subject } from "../types";
import { Button, Card, Modal, Input, Select, EmptyState, Spinner } from "../components/ui";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface ExamSubjectDraft {
  subjectId: string;
  maxMarks: number;
  passMarks: number;
}

export default function Exams() {
  const { user } = useAuth();
  const canManage = user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", classSectionId: "", startDate: "", endDate: "" });
  const [examSubjects, setExamSubjects] = useState<ExamSubjectDraft[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const list = await examsApi.listExams();
      setExams(list);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    academicsApi.listClasses().then(setClasses).catch(() => {});
    academicsApi.listSubjects().then(setSubjects).catch(() => {});
  }, []);

  const toggleSubject = (subjectId: string) => {
    setExamSubjects((prev) =>
      prev.some((s) => s.subjectId === subjectId)
        ? prev.filter((s) => s.subjectId !== subjectId)
        : [...prev, { subjectId, maxMarks: 100, passMarks: 35 }]
    );
  };

  const updateSubjectField = (subjectId: string, field: "maxMarks" | "passMarks", value: number) => {
    setExamSubjects((prev) => prev.map((s) => (s.subjectId === subjectId ? { ...s, [field]: value } : s)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (examSubjects.length === 0) {
      toast.error("Select at least one subject");
      return;
    }
    setSubmitting(true);
    try {
      await examsApi.createExam({ ...form, subjects: examSubjects });
      toast.success("Exam created");
      setModalOpen(false);
      setForm({ name: "", classSectionId: "", startDate: "", endDate: "" });
      setExamSubjects([]);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exams & Results</h1>
          <p className="text-sm text-slate-500">Schedule exams and manage student results</p>
        </div>
        {canManage && <Button onClick={() => setModalOpen(true)}>+ Create Exam</Button>}
      </div>

      {exams.length === 0 ? (
        <Card>
          <EmptyState title="No exams scheduled yet" subtitle="Create your first exam to begin recording results." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Link key={exam.id} to={`/exams/${exam.id}`}>
              <Card className="p-5 transition hover:shadow-md">
                <p className="font-semibold text-slate-800">{exam.name}</p>
                <p className="text-sm text-slate-500">
                  {exam.classSection?.schoolClass?.name} - {exam.classSection?.name}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(exam.startDate).toLocaleDateString()} – {new Date(exam.endDate).toLocaleDateString()}
                </p>
                <p className="mt-2 text-xs font-medium text-brand-600">{exam.subjects.length} subjects</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Exam" wide>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Exam Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select
            label="Class Section"
            required
            value={form.classSectionId}
            onChange={(e) => setForm({ ...form, classSectionId: e.target.value })}
          >
            <option value="">Select a section</option>
            {classes.map((c) =>
              c.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {c.name} - {sec.name}
                </option>
              ))
            )}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Subjects</span>
            <div className="space-y-2">
              {subjects.map((s) => {
                const draft = examSubjects.find((es) => es.subjectId === s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <input type="checkbox" checked={!!draft} onChange={() => toggleSubject(s.id)} />
                    <span className="w-32 text-sm text-slate-700">{s.name}</span>
                    {draft && (
                      <>
                        <input
                          type="number"
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                          value={draft.maxMarks}
                          onChange={(e) => updateSubjectField(s.id, "maxMarks", Number(e.target.value))}
                          placeholder="Max marks"
                        />
                        <input
                          type="number"
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                          value={draft.passMarks}
                          onChange={(e) => updateSubjectField(s.id, "passMarks", Number(e.target.value))}
                          placeholder="Pass marks"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
