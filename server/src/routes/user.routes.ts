import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { updateUserStatusSchema, createParentSchema } from "../validators/user.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

router.get("/", adminOnly, userController.listUsers);
router.patch("/:id/status", adminOnly, validate(updateUserStatusSchema), userController.updateUserStatus);

router.get("/parents", adminOnly, userController.listParents);
router.post("/parents", adminOnly, validate(createParentSchema), userController.createParent);

export default router;
