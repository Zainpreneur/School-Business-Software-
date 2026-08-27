import { api } from "./client";
import { Expense, FeeStructure, Invoice, Paginated, PaymentMethod } from "../types";

export async function listFeeStructures() {
  const { data } = await api.get<{ feeStructures: FeeStructure[] }>("/finance/fee-structures");
  return data.feeStructures;
}

export async function createFeeStructure(payload: {
  name: string;
  classSectionId?: string;
  amount: number;
  frequency: string;
}) {
  const { data } = await api.post<{ feeStructure: FeeStructure }>("/finance/fee-structures", payload);
  return data.feeStructure;
}

export async function deleteFeeStructure(id: string) {
  await api.delete(`/finance/fee-structures/${id}`);
}

export async function listInvoices(query: { page?: number; limit?: number; studentId?: string; status?: string } = {}) {
  const { data } = await api.get<Paginated<Invoice>>("/finance/invoices", { params: query });
  return data;
}

export async function getInvoice(id: string) {
  const { data } = await api.get<{ invoice: Invoice }>(`/finance/invoices/${id}`);
  return data.invoice;
}

export async function createInvoice(payload: {
  studentId: string;
  feeStructureId?: string;
  amount: number;
  discount?: number;
  taxAmount?: number;
  dueDate: string;
}) {
  const { data } = await api.post<{ invoice: Invoice }>("/finance/invoices", payload);
  return data.invoice;
}

export async function recordPayment(
  invoiceId: string,
  payload: { amount: number; method: PaymentMethod; transactionId?: string; notes?: string }
) {
  const { data } = await api.post(`/finance/invoices/${invoiceId}/payments`, payload);
  return data;
}

export async function cancelInvoice(id: string) {
  const { data } = await api.post<{ invoice: Invoice }>(`/finance/invoices/${id}/cancel`);
  return data.invoice;
}

export async function listExpenses(query: { page?: number; limit?: number; category?: string } = {}) {
  const { data } = await api.get<Paginated<Expense>>("/finance/expenses", { params: query });
  return data;
}

export async function createExpense(payload: { title: string; category: string; amount: number; date?: string; notes?: string }) {
  const { data } = await api.post<{ expense: Expense }>("/finance/expenses", payload);
  return data.expense;
}

export async function deleteExpense(id: string) {
  await api.delete(`/finance/expenses/${id}`);
}
