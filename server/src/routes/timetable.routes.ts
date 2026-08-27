import { Router } from "express";
import * as timetableController from "../controllers/timetable.controller";
import { validate } from "../middleware/validate";
import { createTimetableSlotSchema } from "../validators/timetable.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const staff = authorize("SUPER_ADMIN", "ADMIN", "TEACHER");
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

router.post("/", adminOnly, validate(createTimetableSlotSchema), timetableController.createSlot);
router.get("/section/:classSectionId", staff, timetableController.listSlotsForSection);
router.get("/teacher/:teacherId", staff, timetableController.listSlotsForTeacher);
router.delete("/:id", adminOnly, timetableController.deleteSlot);

export default router;
