import pool from "../config/db.js";

export const getExpenseLogs = async (req, res) => {
  try {
    const { vehicle_id, category, start_date, end_date } = req.query;
    let query = `
      SELECT e.*, v.name as vehicle_name, v.license_plate
      FROM expense_logs e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (vehicle_id) {
      query += ` AND e.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
      paramCount++;
    }

    if (category) {
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (start_date) {
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += " ORDER BY e.expense_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get expense logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createExpenseLog = async (req, res) => {
  try {
    const { vehicle_id, trip_id, category, amount, description, expense_date } =
      req.body;

    const result = await pool.query(
      `INSERT INTO expense_logs (vehicle_id, trip_id, category, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicle_id, trip_id, category, amount, description, expense_date],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create expense log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
