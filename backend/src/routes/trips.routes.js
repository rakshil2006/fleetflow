import express from "express";
import { body } from "express-validator";
import {
  getTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../controllers/trips.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getTrips);
router.get("/:id", verifyToken, getTripById);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_trips"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("driver_id").isInt().withMessage("Valid driver ID is required"),
    body("origin").notEmpty().withMessage("Origin is required"),
    body("destination").notEmpty().withMessage("Destination is required"),
    body("cargo_weight_kg")
      .isFloat({ min: 0 })
      .withMessage("Cargo weight must be positive"),
    validate,
  ],
  createTrip,
);

router.patch(
  "/:id/dispatch",
  verifyToken,
  checkPermission("manage_trips"),
  dispatchTrip,
);

router.patch(
  "/:id/complete",
  [
    verifyToken,
    checkPermission("manage_trips"),
    body("end_odometer")
      .isFloat({ min: 0 })
      .withMessage("Valid end odometer is required"),
    validate,
  ],
  completeTrip,
);

router.patch(
  "/:id/cancel",
  verifyToken,
  checkPermission("manage_trips"),
  cancelTrip,
);

export default router;
