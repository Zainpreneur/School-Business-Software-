import { Router } from "express";
import * as studentController from "../controllers/student.controller";
import { validate } from "../middleware/validate";
import { createStudentSchema, updateStudentSchema } from "../validators/student.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", authorize("SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"), studentController.listStudents);
router.get("/:id", authorize("SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"), studentController.getStudent);
router.post("/", authorize("SUPER_ADMIN", "ADMIN"), validate(createStudentSchema), studentController.createStudent);
router.patch("/:id", authorize("SUPER_ADMIN", "ADMIN"), validate(updateStudentSchema), studentController.updateStudent);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), studentController.deleteStudent);

export default router;
