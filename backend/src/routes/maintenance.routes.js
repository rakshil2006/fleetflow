import express from "express";
import { body } from "express-validator";
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  completeMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "../controllers/maintenance.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getMaintenanceLogs);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_maintenance"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("service_type").notEmpty().withMessage("Service type is required"),
    body("service_date")
      .isISO8601()
      .withMessage("Valid service date is required"),
    validate,
  ],
  createMaintenanceLog,
);

router.patch(
  "/:id/complete",
  verifyToken,
  checkPermission("manage_maintenance"),
  completeMaintenanceLog,
);

router.put(
  "/:id",
  [verifyToken, checkPermission("manage_maintenance"), validate],
  updateMaintenanceLog,
);

router.delete(
  "/:id",
  verifyToken,
  checkPermission("manage_maintenance"),
  deleteMaintenanceLog,
);

export default router;
