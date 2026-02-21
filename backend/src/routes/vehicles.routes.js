import express from "express";
import { body } from "express-validator";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  retireVehicle,
  deleteVehicle,
} from "../controllers/vehicles.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getVehicles);
router.get("/:id", verifyToken, getVehicleById);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_vehicles"),
    body("name").notEmpty().withMessage("Name is required"),
    body("license_plate")
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage("License plate is required (max 20 chars)"),
    body("vehicle_type")
      .isIn(["Truck", "Van", "Bike"])
      .withMessage("Invalid vehicle type"),
    body("max_load_capacity_kg")
      .isFloat({ min: 0 })
      .withMessage("Max load capacity must be positive"),
    validate,
  ],
  createVehicle,
);

router.put(
  "/:id",
  [verifyToken, checkPermission("manage_vehicles"), validate],
  updateVehicle,
);

router.patch(
  "/:id/retire",
  verifyToken,
  checkPermission("manage_vehicles"),
  retireVehicle,
);
router.delete(
  "/:id",
  verifyToken,
  checkPermission("manage_vehicles"),
  deleteVehicle,
);

export default router;
