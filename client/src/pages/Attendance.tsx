import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as academicsApi from "../api/academics";
import * as studentsApi from "../api/students";
import * as attendanceApi from "../api/attendance";
import { SchoolClass, Student, AttendanceStatus } from "../types";
import { Button, Card, CardHeader, Select, Spinner, Badge, EmptyState } from "../components/ui";
import { getApiErrorMessage } from "../api/client";

const STATUS_OPTIONS: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"];

const statusColor: Record<AttendanceStatus, "green" | "red" | "yellow" | "blue" | "slate"> = {
  PRESENT: "green",
  ABSENT: "red",
  LATE: "yellow",
  EXCUSED: "blue",
  HALF_DAY: "slate",
};

export default function Attendance() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    academicsApi.listClasses().then(setClasses).catch(() => {});
  }, []);

  const loadStudents = async (id: string) => {
    if (!id) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await studentsApi.listStudents({ classSectionId: id, limit: 100, isActive: true });
      setStudents(res.items);
      const existing = await attendanceApi.getStudentAttendance({ classSectionId: id, from: date, to: date });
      const map: Record<string, AttendanceStatus> = {};
      res.items.forEach((s) => (map[s.id] = "PRESENT"));
      existing.forEach((a) => (map[a.studentId] = a.status));
      setStatuses(map);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(sectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? "PRESENT" }));
      await attendanceApi.markStudentAttendance(date, records);
      toast.success("Attendance saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (map[s.id] = status));
    setStatuses(map);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">Mark and review daily student attendance</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 p-4">
          <Select label="Class Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="min-w-[220px]">
            <option value="">Select a section</option>
            {classes.map((c) =>
              c.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {c.name} - {sec.name}
                </option>
              ))
            )}
          </Select>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          {students.length > 0 && (
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" onClick={() => markAll("PRESENT")}>
                Mark all present
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !sectionId ? (
          <EmptyState title="Select a class section" subtitle="Choose a section above to mark attendance." />
        ) : students.length === 0 ? (
          <EmptyState title="No students in this section" />
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{s.admissionNo}</p>
                </div>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatuses({ ...statuses, [s.id]: status })}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        statuses[s.id] === status ? "" : "opacity-40 hover:opacity-70"
                      }`}
                    >
                      <Badge color={statusColor[status]}>{status.replace("_", " ")}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
