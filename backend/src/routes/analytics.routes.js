import express from "express";
import {
  getDashboardKPIs,
  getVehicleAnalytics,
  getFleetAnalytics,
  getDriverPerformance,
  exportCSV,
  exportPDF,
} from "../controllers/analytics.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";

const router = express.Router();

router.get("/dashboard", verifyToken, getDashboardKPIs);
router.get("/vehicle/:id", verifyToken, getVehicleAnalytics);
router.get(
  "/fleet",
  verifyToken,
  checkPermission("view_analytics"),
  getFleetAnalytics,
);
router.get(
  "/drivers",
  verifyToken,
  checkPermission("view_analytics"),
  getDriverPerformance,
);
router.get(
  "/export/csv",
  verifyToken,
  checkPermission("export_reports"),
  exportCSV,
);
router.get(
  "/export/pdf",
  verifyToken,
  checkPermission("export_reports"),
  exportPDF,
);

export default router;
