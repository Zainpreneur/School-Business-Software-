import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as academicsApi from "../api/academics";
import { SchoolClass, Subject } from "../types";
import { Button, Card, CardHeader, Input, Modal, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Academics() {
  const { user } = useAuth();
  const canManage = user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState("");

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ schoolClassId: "", name: "", roomNo: "", capacity: 40 });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "" });

  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cls, subs] = await Promise.all([academicsApi.listClasses(), academicsApi.listSubjects()]);
      setClasses(cls);
      setSubjects(subs);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicsApi.createClass(className);
      toast.success("Class created");
      setClassModalOpen(false);
      setClassName("");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicsApi.createSection(sectionForm);
      toast.success("Section created");
      setSectionModalOpen(false);
      setSectionForm({ schoolClassId: "", name: "", roomNo: "", capacity: 40 });
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await academicsApi.createSubject(subjectForm);
      toast.success("Subject created");
      setSubjectModalOpen(false);
      setSubjectForm({ name: "", code: "" });
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Classes & Subjects</h1>
        <p className="text-sm text-slate-500">Structure your school's grades, sections, and subjects</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Classes & Sections"
            action={
              canManage && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setSectionModalOpen(true)}>
                    + Section
                  </Button>
                  <Button onClick={() => setClassModalOpen(true)}>+ Class</Button>
                </div>
              )
            }
          />
          <div className="p-5">
            {classes.length === 0 && <EmptyState title="No classes yet" subtitle="Create your first class to begin." />}
            <div className="space-y-4">
              {classes.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-100 p-4">
                  <p className="mb-2 font-semibold text-slate-800">{c.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.sections.map((sec) => (
                      <span key={sec.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Section {sec.name} · {sec._count?.students ?? 0} students
                      </span>
                    ))}
                    {c.sections.length === 0 && <span className="text-xs text-slate-400">No sections yet</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Subjects" action={canManage && <Button onClick={() => setSubjectModalOpen(true)}>+ Subject</Button>} />
          <div className="flex flex-wrap gap-2 p-5">
            {subjects.map((s) => (
              <Badge key={s.id} color="purple">
                {s.name} ({s.code})
              </Badge>
            ))}
            {subjects.length === 0 && <p className="text-sm text-slate-400">No subjects yet.</p>}
          </div>
        </Card>
      </div>

      <Modal open={classModalOpen} onClose={() => setClassModalOpen(false)} title="Add Class">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <Input label="Class Name" placeholder="e.g. Grade 4" required value={className} onChange={(e) => setClassName(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title="Add Section">
        <form onSubmit={handleCreateSection} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Class</span>
            <select
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={sectionForm.schoolClassId}
              onChange={(e) => setSectionForm({ ...sectionForm, schoolClassId: e.target.value })}
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Input label="Section Name" placeholder="e.g. A" required value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} />
          <Input label="Room No" value={sectionForm.roomNo} onChange={(e) => setSectionForm({ ...sectionForm, roomNo: e.target.value })} />
          <Input
            label="Capacity"
            type="number"
            value={sectionForm.capacity}
            onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} title="Add Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <Input label="Subject Name" required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <Input label="Subject Code" required value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
