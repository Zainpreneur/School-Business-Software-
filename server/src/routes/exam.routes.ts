import { Router } from "express";
import * as examController from "../controllers/exam.controller";
import { validate } from "../middleware/validate";
import { createExamSchema, recordResultsSchema } from "../validators/exam.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const staff = authorize("SUPER_ADMIN", "ADMIN", "TEACHER");
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");
const anyAuthenticated = authorize();

router.get("/", staff, examController.listExams);
router.post("/", adminOnly, validate(createExamSchema), examController.createExam);
router.get("/:id", staff, examController.getExam);
router.delete("/:id", adminOnly, examController.deleteExam);

router.post(
  "/subjects/:examSubjectId/results",
  staff,
  validate(recordResultsSchema),
  examController.recordResults
);

router.get(
  "/:examId/report-card/:studentId",
  anyAuthenticated,
  examController.getReportCard
);

export default router;
