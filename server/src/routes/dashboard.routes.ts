import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN", "ACCOUNTANT"));

router.get("/overview", dashboardController.getOverview);
router.get("/finance-trends", dashboardController.getFinanceTrends);

export default router;
