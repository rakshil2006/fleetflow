import pool from "../config/db.js";

export const getVehicles = async (req, res) => {
  try {
    const { status, type, region } = req.query;
    let query = "SELECT * FROM vehicles WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND vehicle_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (region) {
      query += ` AND region = $${paramCount}`;
      params.push(region);
      paramCount++;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const {
      name,
      model,
      license_plate,
      vehicle_type,
      max_load_capacity_kg,
      odometer_km,
      region,
      acquisition_cost,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (name, model, license_plate, vehicle_type, max_load_capacity_kg, odometer_km, region, acquisition_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        model,
        license_plate,
        vehicle_type,
        max_load_capacity_kg,
        odometer_km || 0,
        region,
        acquisition_cost,
      ],
    );

    // Emit socket event
    if (req.io) {
      req.io.emit("vehicle:created", result.rows[0]);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "License plate already exists" });
    }
    console.error("Create vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      model,
      license_plate,
      vehicle_type,
      max_load_capacity_kg,
      odometer_km,
      region,
      acquisition_cost,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE vehicles 
       SET name = $1, model = $2, license_plate = $3, vehicle_type = $4, 
           max_load_capacity_kg = $5, odometer_km = $6, region = $7, 
           acquisition_cost = $8, status = $9
       WHERE id = $10 RETURNING *`,
      [
        name,
        model,
        license_plate,
        vehicle_type,
        max_load_capacity_kg,
        odometer_km,
        region,
        acquisition_cost,
        status,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Emit socket event
    if (req.io) {
      req.io.emit("vehicle:status_updated", result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const retireVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *",
      ["retired", id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Emit socket event
    if (req.io) {
      req.io.emit("vehicle:status_updated", result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Retire vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM vehicles WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
