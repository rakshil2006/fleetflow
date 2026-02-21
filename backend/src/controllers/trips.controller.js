import pool from "../config/db.js";

export const getTrips = async (req, res) => {
  try {
    const { status, vehicle_id, driver_id } = req.query;
    let query = `
      SELECT t.*, v.name as vehicle_name, v.license_plate, d.name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (vehicle_id) {
      query += ` AND t.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
      paramCount++;
    }

    if (driver_id) {
      query += ` AND t.driver_id = $${paramCount}`;
      params.push(driver_id);
      paramCount++;
    }

    query += " ORDER BY t.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT t.*, v.name as vehicle_name, v.license_plate, d.name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTrip = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      vehicle_id,
      driver_id,
      origin,
      destination,
      cargo_description,
      cargo_weight_kg,
      revenue,
    } = req.body;

    // Validate vehicle exists and get details
    const vehicleResult = await client.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [vehicle_id],
    );

    if (vehicleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = vehicleResult.rows[0];

    // Check cargo weight
    if (cargo_weight_kg > vehicle.max_load_capacity_kg) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cargo weight exceeds vehicle max capacity",
        max_capacity: vehicle.max_load_capacity_kg,
        requested: cargo_weight_kg,
      });
    }

    // Validate driver exists and get details
    const driverResult = await client.query(
      "SELECT * FROM drivers WHERE id = $1",
      [driver_id],
    );

    if (driverResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Driver not found" });
    }

    const driver = driverResult.rows[0];

    // Check license expiry
    const today = new Date();
    const expiryDate = new Date(driver.license_expiry_date);

    if (expiryDate < today) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Driver license is expired",
        expiry_date: driver.license_expiry_date,
      });
    }

    // Check license category matches vehicle type
    if (driver.license_category !== vehicle.vehicle_type) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Driver license category does not match vehicle type",
        driver_category: driver.license_category,
        vehicle_type: vehicle.vehicle_type,
      });
    }

    // Check vehicle availability
    if (vehicle.status !== "available") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Vehicle is not available",
        current_status: vehicle.status,
      });
    }

    // Check driver availability
    if (["on_trip", "suspended"].includes(driver.status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Driver is not available",
        current_status: driver.status,
      });
    }

    // Create trip
    const tripResult = await client.query(
      `INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_description, cargo_weight_kg, revenue, start_odometer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        vehicle_id,
        driver_id,
        origin,
        destination,
        cargo_description,
        cargo_weight_kg,
        revenue || 0,
        vehicle.odometer_km,
      ],
    );

    await client.query("COMMIT");

    // Emit socket event
    if (req.io) {
      req.io.emit("trip:created", tripResult.rows[0]);
    }

    res.status(201).json(tripResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const dispatchTrip = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    // Get trip details
    const tripResult = await client.query("SELECT * FROM trips WHERE id = $1", [
      id,
    ]);

    if (tripResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trip not found" });
    }

    const trip = tripResult.rows[0];

    if (trip.status !== "draft") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Trip is not in draft status" });
    }

    // Update trip status
    await client.query(
      "UPDATE trips SET status = $1, dispatched_at = NOW() WHERE id = $2",
      ["dispatched", id],
    );

    // Update vehicle status
    await client.query("UPDATE vehicles SET status = $1 WHERE id = $2", [
      "on_trip",
      trip.vehicle_id,
    ]);

    // Update driver status
    await client.query(
      "UPDATE drivers SET status = $1, total_trips = total_trips + 1 WHERE id = $2",
      ["on_trip", trip.driver_id],
    );

    const updatedTrip = await client.query(
      "SELECT * FROM trips WHERE id = $1",
      [id],
    );

    await client.query("COMMIT");

    // Emit socket events
    if (req.io) {
      req.io.emit("trip:dispatched", updatedTrip.rows[0]);
      req.io.emit("vehicle:status_updated", {
        id: trip.vehicle_id,
        status: "on_trip",
      });
      req.io.emit("driver:status_updated", {
        id: trip.driver_id,
        status: "on_trip",
      });
    }

    res.json(updatedTrip.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Dispatch trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const completeTrip = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { end_odometer } = req.body;

    if (!end_odometer || end_odometer <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Valid end odometer is required" });
    }

    // Get trip details
    const tripResult = await client.query("SELECT * FROM trips WHERE id = $1", [
      id,
    ]);

    if (tripResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trip not found" });
    }

    const trip = tripResult.rows[0];

    if (trip.status !== "dispatched") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Trip is not dispatched" });
    }

    // Update trip
    await client.query(
      "UPDATE trips SET status = $1, end_odometer = $2, completed_at = NOW() WHERE id = $3",
      ["completed", end_odometer, id],
    );

    // Update vehicle
    await client.query(
      "UPDATE vehicles SET status = $1, odometer_km = $2 WHERE id = $3",
      ["available", end_odometer, trip.vehicle_id],
    );

    // Update driver
    await client.query(
      "UPDATE drivers SET status = $1, completed_trips = completed_trips + 1 WHERE id = $2",
      ["off_duty", trip.driver_id],
    );

    const updatedTrip = await client.query(
      "SELECT * FROM trips WHERE id = $1",
      [id],
    );

    await client.query("COMMIT");

    // Emit socket events
    if (req.io) {
      req.io.emit("trip:completed", updatedTrip.rows[0]);
      req.io.emit("vehicle:status_updated", {
        id: trip.vehicle_id,
        status: "available",
      });
      req.io.emit("driver:status_updated", {
        id: trip.driver_id,
        status: "off_duty",
      });
    }

    res.json(updatedTrip.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Complete trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const cancelTrip = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const tripResult = await client.query("SELECT * FROM trips WHERE id = $1", [
      id,
    ]);

    if (tripResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Trip not found" });
    }

    const trip = tripResult.rows[0];

    // Update trip status
    await client.query("UPDATE trips SET status = $1 WHERE id = $2", [
      "cancelled",
      id,
    ]);

    // If trip was dispatched, reset vehicle and driver status
    if (trip.status === "dispatched") {
      await client.query("UPDATE vehicles SET status = $1 WHERE id = $2", [
        "available",
        trip.vehicle_id,
      ]);
      await client.query("UPDATE drivers SET status = $1 WHERE id = $2", [
        "off_duty",
        trip.driver_id,
      ]);
    }

    const updatedTrip = await client.query(
      "SELECT * FROM trips WHERE id = $1",
      [id],
    );

    await client.query("COMMIT");

    res.json(updatedTrip.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Cancel trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};
