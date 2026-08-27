import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema, changePasswordSchema } from "../validators/auth.validators";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
// Only admins can create staff/other accounts; the first super-admin is created via the seed script.
router.post("/register", authenticate, authorize("SUPER_ADMIN", "ADMIN"), validate(registerSchema), authController.register);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);
router.post("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
