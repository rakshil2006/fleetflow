import pool from "../config/db.js";

export const getMaintenanceLogs = async (req, res) => {
  try {
    const { vehicle_id, status, start_date, end_date } = req.query;
    let query = `
      SELECT m.*, v.name as vehicle_name, v.license_plate
      FROM maintenance_logs m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (vehicle_id) {
      query += ` AND m.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
      paramCount++;
    }

    if (status) {
      query += ` AND m.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (start_date) {
      query += ` AND m.service_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND m.service_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += " ORDER BY m.service_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get maintenance logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMaintenanceLog = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { vehicle_id, service_type, description, cost, service_date } =
      req.body;

    // Create maintenance log
    const result = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, service_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [vehicle_id, service_type, description, cost, service_date],
    );

    // Auto set vehicle to in_shop
    await client.query("UPDATE vehicles SET status = $1 WHERE id = $2", [
      "in_shop",
      vehicle_id,
    ]);

    await client.query("COMMIT");

    // Emit socket event
    if (req.io) {
      req.io.emit("maintenance:alert", result.rows[0]);
      req.io.emit("vehicle:status_updated", {
        id: vehicle_id,
        status: "in_shop",
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create maintenance log error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const completeMaintenanceLog = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    // Get maintenance log
    const maintenanceResult = await client.query(
      "SELECT * FROM maintenance_logs WHERE id = $1",
      [id],
    );

    if (maintenanceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Maintenance log not found" });
    }

    const maintenance = maintenanceResult.rows[0];

    // Update maintenance log
    await client.query(
      "UPDATE maintenance_logs SET status = $1, completed_date = NOW() WHERE id = $2",
      ["completed", id],
    );

    // Set vehicle back to available
    await client.query("UPDATE vehicles SET status = $1 WHERE id = $2", [
      "available",
      maintenance.vehicle_id,
    ]);

    const updatedLog = await client.query(
      "SELECT * FROM maintenance_logs WHERE id = $1",
      [id],
    );

    await client.query("COMMIT");

    // Emit socket event
    if (req.io) {
      req.io.emit("vehicle:status_updated", {
        id: maintenance.vehicle_id,
        status: "available",
      });
    }

    res.json(updatedLog.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Complete maintenance log error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const updateMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_type, description, cost, service_date } = req.body;

    const result = await pool.query(
      `UPDATE maintenance_logs 
       SET service_type = $1, description = $2, cost = $3, service_date = $4
       WHERE id = $5 RETURNING *`,
      [service_type, description, cost, service_date, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Maintenance log not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update maintenance log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMaintenanceLog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM maintenance_logs WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Maintenance log not found" });
    }

    res.json({ message: "Maintenance log deleted successfully" });
  } catch (error) {
    console.error("Delete maintenance log error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
