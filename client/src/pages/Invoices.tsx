import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as financeApi from "../api/finance";
import * as studentsApi from "../api/students";
import { Invoice, FeeStructure, Student, PaymentMethod } from "../types";
import { Button, Card, CardHeader, Input, Select, Modal, Pagination, EmptyState, Spinner, Badge } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num || 0);
}

const invoiceStatusColor: Record<string, "green" | "red" | "yellow" | "slate"> = {
  PAID: "green",
  PARTIALLY_PAID: "yellow",
  ISSUED: "slate",
  OVERDUE: "red",
  CANCELLED: "red",
  DRAFT: "slate",
};

export default function Invoices() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: "",
    feeStructureId: "",
    amount: "",
    discount: "0",
    taxAmount: "0",
    dueDate: "",
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "CASH" as PaymentMethod, transactionId: "", notes: "" });

  const [feeStructureModalOpen, setFeeStructureModalOpen] = useState(false);
  const [feeStructureForm, setFeeStructureForm] = useState({ name: "", amount: "", frequency: "MONTHLY" });

  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await financeApi.listInvoices({ page, limit: 10 });
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
    financeApi.listFeeStructures().then(setFeeStructures).catch(() => {});
  }, []);

  useEffect(() => {
    if (studentQuery.length < 2) {
      setStudentResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      studentsApi.listStudents({ search: studentQuery, limit: 5 }).then((res) => setStudentResults(res.items));
    }, 300);
    return () => clearTimeout(timeout);
  }, [studentQuery]);

  const handleFeeStructureSelect = (id: string) => {
    const fs = feeStructures.find((f) => f.id === id);
    setInvoiceForm({ ...invoiceForm, feeStructureId: id, amount: fs ? String(fs.amount) : invoiceForm.amount });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeApi.createInvoice({
        studentId: invoiceForm.studentId,
        feeStructureId: invoiceForm.feeStructureId || undefined,
        amount: Number(invoiceForm.amount),
        discount: Number(invoiceForm.discount || 0),
        taxAmount: Number(invoiceForm.taxAmount || 0),
        dueDate: invoiceForm.dueDate,
      });
      toast.success("Invoice created");
      setInvoiceModalOpen(false);
      setInvoiceForm({ studentId: "", feeStructureId: "", amount: "", discount: "0", taxAmount: "0", dueDate: "" });
      setStudentQuery("");
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    const remaining = Number(invoice.totalAmount) - Number(invoice.amountPaid);
    setPaymentForm({ amount: String(remaining), method: "CASH", transactionId: "", notes: "" });
    setPaymentModalOpen(true);
  };

  const loadFeeStructures = () => financeApi.listFeeStructures().then(setFeeStructures).catch(() => {});

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeApi.createFeeStructure({
        name: feeStructureForm.name,
        amount: Number(feeStructureForm.amount),
        frequency: feeStructureForm.frequency,
      });
      toast.success("Fee structure created");
      setFeeStructureModalOpen(false);
      setFeeStructureForm({ name: "", amount: "", frequency: "MONTHLY" });
      loadFeeStructures();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeeStructure = async (id: string) => {
    try {
      await financeApi.deleteFeeStructure(id);
      toast.success("Fee structure removed");
      loadFeeStructures();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;
    setSubmitting(true);
    try {
      await financeApi.recordPayment(activeInvoice.id, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        transactionId: paymentForm.transactionId || undefined,
        notes: paymentForm.notes || undefined,
      });
      toast.success("Payment recorded");
      setPaymentModalOpen(false);
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
          <h1 className="text-2xl font-bold text-slate-800">Fees & Invoices</h1>
          <p className="text-sm text-slate-500">Issue invoices and record student fee payments</p>
        </div>
        <Button onClick={() => setInvoiceModalOpen(true)}>+ New Invoice</Button>
      </div>

      <Card>
        <CardHeader title="Invoices" />
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="No invoices yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Invoice No</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{inv.invoiceNo}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : "—"}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-3 text-slate-600">{formatCurrency(inv.amountPaid)}</td>
                    <td className="px-5 py-3 text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Badge color={invoiceStatusColor[inv.status] ?? "slate"}>{inv.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                        <button onClick={() => openPaymentModal(inv)} className="text-brand-600 hover:underline">
                          Record Payment
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

      <Card>
        <CardHeader title="Fee Structures" action={<Button variant="secondary" onClick={() => setFeeStructureModalOpen(true)}>+ Fee Structure</Button>} />
        {feeStructures.length === 0 ? (
          <EmptyState title="No fee structures yet" subtitle="Create reusable fee templates like Tuition or Transport." />
        ) : (
          <div className="divide-y divide-slate-100">
            {feeStructures.map((fs) => (
              <div key={fs.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-slate-800">{fs.name}</p>
                  <p className="text-xs text-slate-400">{fs.frequency}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-slate-700">{formatCurrency(fs.amount)}</p>
                  <button onClick={() => handleDeleteFeeStructure(fs.id)} className="text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="Create Invoice" wide>
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="relative">
            <Input
              label="Search Student"
              placeholder="Type student name..."
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />
            {studentResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                {studentResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setInvoiceForm({ ...invoiceForm, studentId: s.id });
                      setStudentQuery(`${s.firstName} ${s.lastName} (${s.admissionNo})`);
                      setStudentResults([]);
                    }}
                  >
                    {s.firstName} {s.lastName} — {s.admissionNo}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select label="Fee Structure (optional)" value={invoiceForm.feeStructureId} onChange={(e) => handleFeeStructureSelect(e.target.value)}>
            <option value="">Custom amount</option>
            {feeStructures.map((fs) => (
              <option key={fs.id} value={fs.id}>
                {fs.name} — {formatCurrency(fs.amount)}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              required
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
            />
            <Input
              label="Discount"
              type="number"
              step="0.01"
              value={invoiceForm.discount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
            />
            <Input
              label="Tax"
              type="number"
              step="0.01"
              value={invoiceForm.taxAmount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: e.target.value })}
            />
          </div>
          <Input label="Due Date" type="date" required value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !invoiceForm.studentId}>
              {submitting ? "Saving..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={feeStructureModalOpen} onClose={() => setFeeStructureModalOpen(false)} title="Add Fee Structure">
        <form onSubmit={handleCreateFeeStructure} className="space-y-4">
          <Input label="Name" placeholder="e.g. Tuition Fee - Grade 1" required value={feeStructureForm.name} onChange={(e) => setFeeStructureForm({ ...feeStructureForm, name: e.target.value })} />
          <Input label="Amount" type="number" step="0.01" required value={feeStructureForm.amount} onChange={(e) => setFeeStructureForm({ ...feeStructureForm, amount: e.target.value })} />
          <Select label="Frequency" value={feeStructureForm.frequency} onChange={(e) => setFeeStructureForm({ ...feeStructureForm, frequency: e.target.value })}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="ANNUAL">Annual</option>
            <option value="ONE_TIME">One Time</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFeeStructureModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={`Record Payment — ${activeInvoice?.invoiceNo ?? ""}`}>
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            required
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />
          <Select label="Payment Method" value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="ONLINE">Online</option>
            <option value="CHEQUE">Cheque</option>
          </Select>
          <Input
            label="Transaction ID (optional)"
            value={paymentForm.transactionId}
            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
