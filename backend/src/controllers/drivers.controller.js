import pool from "../config/db.js";

export const getDrivers = async (req, res) => {
  try {
    const { status, license_category } = req.query;
    let query = "SELECT * FROM drivers WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (license_category) {
      query += ` AND license_category = $${paramCount}`;
      params.push(license_category);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get drivers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM drivers WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get driver error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      license_number,
      license_category,
      license_expiry_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (name, email, phone, license_number, license_category, license_expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        email,
        phone,
        license_number,
        license_category,
        license_expiry_date,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "License number already exists" });
    }
    console.error("Create driver error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      license_number,
      license_category,
      license_expiry_date,
      safety_score,
    } = req.body;

    const result = await pool.query(
      `UPDATE drivers 
       SET name = $1, email = $2, phone = $3, license_number = $4, 
           license_category = $5, license_expiry_date = $6, safety_score = $7
       WHERE id = $8 RETURNING *`,
      [
        name,
        email,
        phone,
        license_number,
        license_category,
        license_expiry_date,
        safety_score,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update driver error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["on_duty", "on_trip", "off_duty", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Emit socket event
    if (req.io) {
      req.io.emit("driver:status_updated", result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update driver status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
