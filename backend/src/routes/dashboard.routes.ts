import express from "express";
import { getDashboardSummary, getUpcomingDueTasks } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/upcoming", getUpcomingDueTasks);
router.get("/", getDashboardSummary);

export default router;