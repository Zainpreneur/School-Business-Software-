import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as announcementsApi from "../api/announcements";
import { Announcement, Role } from "../types";
import { Button, Card, Modal, Input, Textarea, Pagination, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const ROLE_OPTIONS: Role[] = ["ADMIN", "TEACHER", "ACCOUNTANT", "STUDENT", "PARENT"];

export default function Announcements() {
  const { user } = useAuth();
  const canManage = user && ["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(user.role);
  const canDelete = user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  const [items, setItems] = useState<Announcement[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: [] as Role[] });

  const load = async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.listAnnouncements(page);
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

  const toggleAudience = (role: Role) => {
    setForm((f) => ({
      ...f,
      audience: f.audience.includes(role) ? f.audience.filter((r) => r !== role) : [...f.audience, role],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementsApi.createAnnouncement(form);
      toast.success("Announcement posted");
      setModalOpen(false);
      setForm({ title: "", body: "", audience: [] });
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementsApi.deleteAnnouncement(id);
      toast.success("Announcement removed");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-sm text-slate-500">School-wide notices and updates</p>
        </div>
        {canManage && <Button onClick={() => setModalOpen(true)}>+ New Announcement</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState title="No announcements yet" />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {a.audience.length === 0 ? (
                      <Badge color="blue">Everyone</Badge>
                    ) : (
                      a.audience.map((r) => (
                        <Badge key={r} color="slate">
                          {r.replace("_", " ")}
                        </Badge>
                      ))
                    )}
                    <span className="text-xs text-slate-400">
                      {a.author?.firstName} {a.author?.lastName} · {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {canDelete && (
                  <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement" wide>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Message" required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Audience (leave empty for everyone)</span>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleAudience(r)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.audience.includes(r) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {r.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Announcement"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
