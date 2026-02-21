import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, security_question, security_answer } =
      req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Hash security answer if provided
    let security_answer_hash = null;
    if (security_answer) {
      security_answer_hash = await bcrypt.hash(
        security_answer.toLowerCase().trim(),
        saltRounds,
      );
    }

    // Create user with or without security questions
    let result;
    if (security_question && security_answer_hash) {
      result = await pool.query(
        "INSERT INTO users (name, email, password_hash, role, security_question, security_answer_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
        [
          name,
          email,
          password_hash,
          role,
          security_question,
          security_answer_hash,
        ],
      );
    } else {
      result = await pool.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
        [name, email, password_hash, role],
      );
    }

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    res.status(500).json({ error: "Internal server error" });
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT security_question FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({ security_question: result.rows[0].security_question });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, security_answer } = req.body;

    const result = await pool.query(
      "SELECT security_answer_hash FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidAnswer = await bcrypt.compare(
      security_answer.toLowerCase().trim(),
      result.rows[0].security_answer_hash,
    );

    if (!isValidAnswer) {
      return res.status(401).json({ error: "Incorrect security answer" });
    }

    res.json({ message: "Security answer verified" });
  } catch (error) {
    console.error("Verify security answer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, security_answer, new_password } = req.body;

    // Verify security answer again
    const result = await pool.query(
      "SELECT security_answer_hash FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidAnswer = await bcrypt.compare(
      security_answer.toLowerCase().trim(),
      result.rows[0].security_answer_hash,
    );

    if (!isValidAnswer) {
      return res.status(401).json({ error: "Incorrect security answer" });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      password_hash,
      email,
    ]);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
