import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller";
import { validate } from "../middleware/validate";
import { markStudentAttendanceSchema, markStaffAttendanceSchema } from "../validators/attendance.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const staff = authorize("SUPER_ADMIN", "ADMIN", "TEACHER");
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

router.post("/students", staff, validate(markStudentAttendanceSchema), attendanceController.markStudentAttendance);
router.get("/students", authorize("SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT", "STUDENT"), attendanceController.getStudentAttendance);
router.get("/students/:studentId/summary", authorize("SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT", "STUDENT"), attendanceController.getStudentAttendanceSummary);

router.post("/staff", adminOnly, validate(markStaffAttendanceSchema), attendanceController.markStaffAttendance);
router.get("/staff", adminOnly, attendanceController.getStaffAttendance);

export default router;
