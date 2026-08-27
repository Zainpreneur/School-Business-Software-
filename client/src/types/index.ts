export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  sections: ClassSection[];
}

export interface ClassSection {
  id: string;
  name: string;
  schoolClassId: string;
  schoolClass?: SchoolClass;
  roomNo?: string | null;
  capacity: number;
  classTeacherId?: string | null;
  classTeacher?: Teacher | null;
  _count?: { students: number };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeCode: string;
  qualification?: string | null;
  salary?: string | number | null;
  address?: string | null;
  subjects?: { subject: Subject }[];
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  address?: string | null;
  students?: { id: string; firstName: string; lastName: string }[];
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  admissionDate: string;
  isActive: boolean;
  classSectionId?: string | null;
  classSection?: ClassSection | null;
  parentId?: string | null;
  parent?: Parent | null;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HALF_DAY";

export interface StudentAttendance {
  id: string;
  studentId: string;
  student?: { id: string; firstName: string; lastName: string; admissionNo: string };
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface Exam {
  id: string;
  name: string;
  classSectionId: string;
  classSection?: ClassSection;
  startDate: string;
  endDate: string;
  subjects: ExamSubject[];
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  subject: Subject;
  examDate?: string | null;
  maxMarks: number;
  passMarks: number;
  results?: ExamResult[];
}

export interface ExamResult {
  id: string;
  examSubjectId: string;
  studentId: string;
  student?: Student;
  marksObtained: number;
  grade?: string | null;
  remarks?: string | null;
}

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE" | "CHEQUE";

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  student?: Student;
  amount: string | number;
  discount: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  amountPaid: string | number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string | number;
  method: PaymentMethod;
  transactionId?: string | null;
  paidAt: string;
  notes?: string | null;
}

export interface FeeStructure {
  id: string;
  name: string;
  classSectionId?: string | null;
  classSection?: ClassSection | null;
  amount: string | number;
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "ONE_TIME";
}

export type ExpenseCategory =
  | "SALARY"
  | "UTILITIES"
  | "MAINTENANCE"
  | "SUPPLIES"
  | "TRANSPORT"
  | "MARKETING"
  | "OTHER";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: string | number;
  date: string;
  notes?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: Role[];
  author?: { firstName: string; lastName: string; role: Role };
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
