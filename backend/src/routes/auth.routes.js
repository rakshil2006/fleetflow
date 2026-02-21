import express from "express";
import { body } from "express-validator";
import {
  signup,
  login,
  getMe,
  verifyEmail,
  verifySecurityAnswer,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn([
        "fleet_manager",
        "dispatcher",
        "safety_officer",
        "financial_analyst",
      ])
      .withMessage("Invalid role"),
    body("security_question").optional(),
    body("security_answer").optional(),
    validate,
  ],
  signup,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  login,
);

router.post(
  "/verify-email",
  [body("email").isEmail().withMessage("Valid email is required"), validate],
  verifyEmail,
);

router.post(
  "/verify-security-answer",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("security_answer")
      .notEmpty()
      .withMessage("Security answer is required"),
    validate,
  ],
  verifySecurityAnswer,
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("security_answer")
      .notEmpty()
      .withMessage("Security answer is required"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validate,
  ],
  resetPassword,
);

router.get("/me", verifyToken, getMe);

export default router;
