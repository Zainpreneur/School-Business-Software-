import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller";
import { validate } from "../middleware/validate";
import { createAnnouncementSchema } from "../validators/announcement.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", announcementController.listAnnouncements);
router.post("/", authorize("SUPER_ADMIN", "ADMIN", "TEACHER"), validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.delete("/:id", authorize("SUPER_ADMIN", "ADMIN"), announcementController.deleteAnnouncement);

export default router;
