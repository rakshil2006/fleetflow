import pool from "../config/db.js";

export const getFuelLogs = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query;
    let query = `
      SELECT f.*, v.name as vehicle_name, v.license_plate
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (vehicle_id) {
      query += ` AND f.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND f.fuel_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND f.fuel_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += " ORDER BY f.fuel_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get fuel logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createFuelLog = async (req, res) => {
  try {
    const {
      vehicle_id,
      trip_id,
      liters,
      cost_per_liter,
      total_cost,
      odometer_at_fill,
      fuel_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost_per_liter, total_cost, odometer_at_fill, fuel_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        vehicle_id,
        trip_id,
        liters,
        cost_per_liter,
        total_cost,
        odometer_at_fill,
        fuel_date,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create fuel log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
