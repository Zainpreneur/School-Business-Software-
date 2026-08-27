import { Router } from "express";
import * as financeController from "../controllers/finance.controller";
import { validate } from "../middleware/validate";
import {
  createFeeStructureSchema,
  createInvoiceSchema,
  recordPaymentSchema,
  createExpenseSchema,
} from "../validators/finance.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const finance = authorize("SUPER_ADMIN", "ADMIN", "ACCOUNTANT");
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

// Fee structures
router.get("/fee-structures", finance, financeController.listFeeStructures);
router.post("/fee-structures", adminOnly, validate(createFeeStructureSchema), financeController.createFeeStructure);
router.delete("/fee-structures/:id", adminOnly, financeController.deleteFeeStructure);

// Invoices
router.get("/invoices", authorize("SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "PARENT", "STUDENT"), financeController.listInvoices);
router.get("/invoices/:id", authorize("SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "PARENT", "STUDENT"), financeController.getInvoice);
router.post("/invoices", finance, validate(createInvoiceSchema), financeController.createInvoice);
router.post("/invoices/:id/payments", finance, validate(recordPaymentSchema), financeController.recordPayment);
router.post("/invoices/:id/cancel", finance, financeController.cancelInvoice);

// Expenses
router.get("/expenses", finance, financeController.listExpenses);
router.post("/expenses", finance, validate(createExpenseSchema), financeController.createExpense);
router.delete("/expenses/:id", adminOnly, financeController.deleteExpense);

export default router;
