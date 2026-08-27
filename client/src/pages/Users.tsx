import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as usersApi from "../api/users";
import * as authApi from "../api/auth";
import { User, Role } from "../types";
import { Button, Card, CardHeader, Input, Select, Modal, Pagination, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

const ROLE_FILTERS: (Role | "")[] = ["", "ADMIN", "TEACHER", "ACCOUNTANT", "STUDENT", "PARENT"];

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "ADMIN" as Role,
    phone: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.listUsers({ page, limit: 10, role: roleFilter || undefined });
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
  }, [page, roleFilter]);

  const handleToggleStatus = async (u: User) => {
    try {
      await usersApi.updateUserStatus(u.id, !u.isActive);
      toast.success(`User ${u.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.role === "PARENT") {
        await usersApi.createParent(form);
      } else {
        await authApi.registerUser(form);
      }
      toast.success("User created");
      setModalOpen(false);
      setForm({ email: "", password: "", firstName: "", lastName: "", role: "ADMIN", phone: "" });
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
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500">Manage all system accounts and access</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add User</Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <Select value={roleFilter} onChange={(e) => { setPage(1); setRoleFilter(e.target.value as Role | ""); }} className="max-w-xs">
            {ROLE_FILTERS.map((r) => (
              <option key={r} value={r}>
                {r || "All roles"}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge color="purple">{u.role.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={u.isActive ? "green" : "slate"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== "SUPER_ADMIN" && (
                        <button onClick={() => handleToggleStatus(u)} className="text-brand-600 hover:underline">
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="ADMIN">Admin</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="PARENT">Parent</option>
          </Select>
          <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Temporary Password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
