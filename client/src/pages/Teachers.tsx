import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as teachersApi from "../api/teachers";
import * as academicsApi from "../api/academics";
import { Teacher, Subject } from "../types";
import { Button, Card, Input, Modal, Pagination, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

const emptyForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  qualification: "",
  address: "",
  subjectIds: [] as string[],
};

export default function Teachers() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teachersApi.listTeachers({ page, limit: 10 });
      setItems(res.items);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    academicsApi.listSubjects().then(setSubjects).catch(() => {});
  }, []);

  const toggleSubject = (id: string) => {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id) ? f.subjectIds.filter((s) => s !== id) : [...f.subjectIds, id],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teachersApi.createTeacher(form);
      toast.success("Teacher added successfully");
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-sm text-slate-500">Manage teaching staff and subject assignments</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Teacher</Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No teachers yet" subtitle="Add your first teacher to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Employee Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Subjects</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{t.employeeCode}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {t.user.firstName} {t.user.lastName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{t.user.email}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects ?? []).map((s) => (
                          <Badge key={s.subject.id} color="blue">
                            {s.subject.name}
                          </Badge>
                        ))}
                        {(t.subjects ?? []).length === 0 && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={t.user.isActive ? "green" : "slate"}>{t.user.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Teacher" wide>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="Temporary Password"
            type="text"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          <Input label="Address" className="sm:col-span-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Subjects</span>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSubject(s.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.subjectIds.includes(s.id)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-300 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Teacher"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
