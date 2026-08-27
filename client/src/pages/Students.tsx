import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import * as studentsApi from "../api/students";
import * as academicsApi from "../api/academics";
import { Student, SchoolClass } from "../types";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge, Input, Select, Modal, Pagination, EmptyState, Spinner } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

const emptyForm = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
  address: "",
  phone: "",
  email: "",
  classSectionId: "",
};

export default function Students() {
  const { user } = useAuth();
  const canManage = user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  const [items, setItems] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsApi.listStudents({ page, limit: 10, search: search || undefined });
      setItems(res.items);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    academicsApi.listClasses().then(setClasses).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentsApi.createStudent({
        ...form,
        classSectionId: form.classSectionId || undefined,
        email: form.email || undefined,
      });
      toast.success("Student enrolled successfully");
      setModalOpen(false);
      setForm(emptyForm);
      loadStudents();
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
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500">Manage student enrollment and records</p>
        </div>
        {canManage && <Button onClick={() => setModalOpen(true)}>+ Add Student</Button>}
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-2 border-b border-slate-100 p-4">
          <Input placeholder="Search by name or admission no..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No students found" subtitle="Try adjusting your search or add a new student." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Admission No</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.admissionNo}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {s.classSection ? `${s.classSection.schoolClass?.name} - ${s.classSection.name}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.gender}</td>
                    <td className="px-5 py-3">
                      <Badge color={s.isActive ? "green" : "slate"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/students/${s.id}`} className="text-brand-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Student" wide>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Date of Birth" type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
          <Select label="Class Section" value={form.classSectionId} onChange={(e) => setForm({ ...form, classSectionId: e.target.value })}>
            <option value="">Unassigned</option>
            {classes.map((c) =>
              c.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {c.name} - {sec.name}
                </option>
              ))
            )}
          </Select>
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="Address"
            className="sm:col-span-2"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Student"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
