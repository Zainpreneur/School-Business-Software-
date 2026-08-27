import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as financeApi from "../api/finance";
import { Expense, ExpenseCategory } from "../types";
import { Button, Card, CardHeader, Input, Select, Modal, Pagination, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
}

const CATEGORIES: ExpenseCategory[] = ["SALARY", "UTILITIES", "MAINTENANCE", "SUPPLIES", "TRANSPORT", "MARKETING", "OTHER"];

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", category: "OTHER" as ExpenseCategory, amount: "", date: "", notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listExpenses({ page, limit: 10 });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeApi.createExpense({
        title: form.title,
        category: form.category,
        amount: Number(form.amount),
        date: form.date || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Expense recorded");
      setModalOpen(false);
      setForm({ title: "", category: "OTHER", amount: "", date: "", notes: "" });
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
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-sm text-slate-500">Track operational costs and spending</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Expense</Button>
      </div>

      <Card>
        <CardHeader title="Expense Log" />
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No expenses recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{exp.title}</td>
                    <td className="px-5 py-3">
                      <Badge color="purple">{exp.category}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{formatCurrency(exp.amount)}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Amount" type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
