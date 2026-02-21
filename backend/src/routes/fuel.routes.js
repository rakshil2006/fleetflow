import express from "express";
import { body } from "express-validator";
import { getFuelLogs, createFuelLog } from "../controllers/fuel.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getFuelLogs);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_fuel"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("liters").isFloat({ min: 0 }).withMessage("Liters must be positive"),
    body("total_cost")
      .isFloat({ min: 0 })
      .withMessage("Total cost must be non-negative"),
    body("fuel_date").isISO8601().withMessage("Valid fuel date is required"),
    validate,
  ],
  createFuelLog,
);

export default router;
