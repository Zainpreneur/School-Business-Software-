import { Router } from "express";
import * as teacherController from "../controllers/teacher.controller";
import { validate } from "../middleware/validate";
import { createTeacherSchema, updateTeacherSchema } from "../validators/teacher.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", authorize("SUPER_ADMIN", "ADMIN"), teacherController.listTeachers);
router.get("/:id", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), teacherController.getTeacher);
router.post("/", authorize("SUPER_ADMIN", "ADMIN"), validate(createTeacherSchema), teacherController.createTeacher);
router.patch("/:id", authorize("SUPER_ADMIN", "ADMIN"), validate(updateTeacherSchema), teacherController.updateTeacher);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), teacherController.deleteTeacher);

export default router;
