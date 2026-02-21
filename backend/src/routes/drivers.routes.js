import express from "express";
import { body } from "express-validator";
import {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  updateDriverStatus,
} from "../controllers/drivers.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getDrivers);
router.get("/:id", verifyToken, getDriverById);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_drivers"),
    body("name").notEmpty().withMessage("Name is required"),
    body("license_number").notEmpty().withMessage("License number is required"),
    body("license_expiry_date")
      .isISO8601()
      .withMessage("Valid expiry date is required"),
    validate,
  ],
  createDriver,
);

router.put(
  "/:id",
  [verifyToken, checkPermission("manage_drivers"), validate],
  updateDriver,
);

router.patch(
  "/:id/status",
  [
    verifyToken,
    checkPermission("manage_drivers"),
    body("status")
      .isIn(["on_duty", "on_trip", "off_duty", "suspended"])
      .withMessage("Invalid status"),
    validate,
  ],
  updateDriverStatus,
);

export default router;
