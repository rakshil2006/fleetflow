import express from "express";
import { body } from "express-validator";
import {
  getExpenseLogs,
  createExpenseLog,
} from "../controllers/expenses.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", verifyToken, getExpenseLogs);

router.post(
  "/",
  [
    verifyToken,
    checkPermission("manage_fuel"),
    body("vehicle_id").isInt().withMessage("Valid vehicle ID is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be non-negative"),
    body("expense_date")
      .isISO8601()
      .withMessage("Valid expense date is required"),
    validate,
  ],
  createExpenseLog,
);

export default router;
