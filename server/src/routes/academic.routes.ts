import { Router } from "express";
import * as academicController from "../controllers/academic.controller";
import { validate } from "../middleware/validate";
import {
  createClassSchema,
  createSectionSchema,
  updateSectionSchema,
  createSubjectSchema,
  assignClassSubjectsSchema,
} from "../validators/academic.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const staff = authorize("SUPER_ADMIN", "ADMIN", "TEACHER");
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

// Classes
router.get("/classes", staff, academicController.listClasses);
router.post("/classes", adminOnly, validate(createClassSchema), academicController.createClass);
router.delete("/classes/:id", adminOnly, academicController.deleteClass);

// Sections
router.post("/sections", adminOnly, validate(createSectionSchema), academicController.createSection);
router.get("/sections/:id", staff, academicController.getSection);
router.patch("/sections/:id", adminOnly, validate(updateSectionSchema), academicController.updateSection);
router.delete("/sections/:id", adminOnly, academicController.deleteSection);
router.put(
  "/sections/:id/subjects",
  adminOnly,
  validate(assignClassSubjectsSchema),
  academicController.assignSectionSubjects
);

// Subjects
router.get("/subjects", staff, academicController.listSubjects);
router.post("/subjects", adminOnly, validate(createSubjectSchema), academicController.createSubject);
router.delete("/subjects/:id", adminOnly, academicController.deleteSubject);

export default router;
