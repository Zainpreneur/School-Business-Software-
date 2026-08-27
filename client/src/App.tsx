import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Teachers from "./pages/Teachers";
import Academics from "./pages/Academics";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import ExamDetail from "./pages/ExamDetail";
import ReportCard from "./pages/ReportCard";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Announcements from "./pages/Announcements";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/teachers" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}><Teachers /></ProtectedRoute>} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/attendance" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "TEACHER"]}><Attendance /></ProtectedRoute>} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:id" element={<ExamDetail />} />
        <Route path="/exams/:examId/report-card/:studentId" element={<ReportCard />} />
        <Route path="/finance/invoices" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"]}><Invoices /></ProtectedRoute>} />
        <Route path="/finance/expenses" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"]}><Expenses /></ProtectedRoute>} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/users" element={<ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}><Users /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
