import pool from "../config/db.js";

export const getDashboardKPIs = async (req, res) => {
  try {
    // Active fleet (vehicles on trip)
    const activeFleetResult = await pool.query(
      "SELECT COUNT(*) as count FROM vehicles WHERE status = 'on_trip'",
    );

    // Maintenance alerts (vehicles in shop)
    const maintenanceAlertsResult = await pool.query(
      "SELECT COUNT(*) as count FROM vehicles WHERE status = 'in_shop'",
    );

    // Total vehicles (non-retired)
    const totalVehiclesResult = await pool.query(
      "SELECT COUNT(*) as count FROM vehicles WHERE status != 'retired'",
    );

    // Utilization rate
    const utilizationRate =
      totalVehiclesResult.rows[0].count > 0
        ? (activeFleetResult.rows[0].count /
            totalVehiclesResult.rows[0].count) *
          100
        : 0;

    // Pending cargo (draft trips)
    const pendingCargoResult = await pool.query(
      "SELECT COUNT(*) as count FROM trips WHERE status = 'draft'",
    );

    // Total drivers
    const totalDriversResult = await pool.query(
      "SELECT COUNT(*) as count FROM drivers",
    );

    // Active trips
    const activeTripsResult = await pool.query(
      "SELECT COUNT(*) as count FROM trips WHERE status = 'dispatched'",
    );

    // This month's fuel cost
    const fuelCostResult = await pool.query(
      `SELECT COALESCE(SUM(total_cost), 0) as total 
       FROM fuel_logs 
       WHERE EXTRACT(MONTH FROM fuel_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM fuel_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    );

    // Recent activity (last 10 status changes)
    const recentActivityResult = await pool.query(`
      (SELECT 'trip' as type, id, status, created_at as timestamp FROM trips ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'maintenance' as type, id, status, created_at as timestamp FROM maintenance_logs ORDER BY created_at DESC LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    res.json({
      activeFleet: parseInt(activeFleetResult.rows[0].count),
      maintenanceAlerts: parseInt(maintenanceAlertsResult.rows[0].count),
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
      pendingCargo: parseInt(pendingCargoResult.rows[0].count),
      totalVehicles: parseInt(totalVehiclesResult.rows[0].count),
      totalDrivers: parseInt(totalDriversResult.rows[0].count),
      activeTrips: parseInt(activeTripsResult.rows[0].count),
      monthlyFuelCost: parseFloat(fuelCostResult.rows[0].total),
      recentActivity: recentActivityResult.rows,
    });
  } catch (error) {
    console.error("Get dashboard KPIs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVehicleAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Vehicle details
    const vehicleResult = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [id],
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = vehicleResult.rows[0];

    // Total fuel cost
    const fuelCostResult = await pool.query(
      "SELECT COALESCE(SUM(total_cost), 0) as total FROM fuel_logs WHERE vehicle_id = $1",
      [id],
    );

    // Total maintenance cost
    const maintenanceCostResult = await pool.query(
      "SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_logs WHERE vehicle_id = $1",
      [id],
    );

    // Total revenue
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(revenue), 0) as total FROM trips WHERE vehicle_id = $1 AND status = 'completed'",
      [id],
    );

    // Total trips
    const tripsResult = await pool.query(
      "SELECT COUNT(*) as count FROM trips WHERE vehicle_id = $1",
      [id],
    );

    // Fuel efficiency (km/L)
    const fuelEfficiencyResult = await pool.query(
      `SELECT 
        COALESCE(SUM(end_odometer - start_odometer), 0) as total_km,
        COALESCE((SELECT SUM(liters) FROM fuel_logs WHERE vehicle_id = $1), 0) as total_liters
       FROM trips 
       WHERE vehicle_id = $1 AND status = 'completed' AND end_odometer IS NOT NULL`,
      [id],
    );

    const totalKm = parseFloat(fuelEfficiencyResult.rows[0].total_km);
    const totalLiters = parseFloat(fuelEfficiencyResult.rows[0].total_liters);
    const fuelEfficiency = totalLiters > 0 ? totalKm / totalLiters : 0;

    // Calculate ROI
    const totalCosts =
      parseFloat(fuelCostResult.rows[0].total) +
      parseFloat(maintenanceCostResult.rows[0].total);
    const totalRevenue = parseFloat(revenueResult.rows[0].total);
    const acquisitionCost = parseFloat(vehicle.acquisition_cost) || 0;
    const roi =
      acquisitionCost > 0
        ? ((totalRevenue - totalCosts) / acquisitionCost) * 100
        : 0;

    res.json({
      vehicle,
      fuelCost: parseFloat(fuelCostResult.rows[0].total),
      maintenanceCost: parseFloat(maintenanceCostResult.rows[0].total),
      totalCosts,
      revenue: totalRevenue,
      roi: parseFloat(roi.toFixed(2)),
      totalTrips: parseInt(tripsResult.rows[0].count),
      fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
    });
  } catch (error) {
    console.error("Get vehicle analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFleetAnalytics = async (req, res) => {
  try {
    // Fleet-wide metrics
    const metricsResult = await pool.query(`
      SELECT 
        v.id,
        v.name,
        v.vehicle_type,
        v.status,
        COALESCE(SUM(f.total_cost), 0) as fuel_cost,
        COALESCE(SUM(m.cost), 0) as maintenance_cost,
        COALESCE(SUM(t.revenue), 0) as revenue,
        COUNT(DISTINCT t.id) as total_trips
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.id = f.vehicle_id
      LEFT JOIN maintenance_logs m ON v.id = m.vehicle_id
      LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'completed'
      WHERE v.status != 'retired'
      GROUP BY v.id, v.name, v.vehicle_type, v.status
      ORDER BY v.name
    `);

    // Utilization by vehicle type
    const utilizationResult = await pool.query(`
      SELECT 
        vehicle_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'on_trip' THEN 1 ELSE 0 END) as on_trip
      FROM vehicles
      WHERE status != 'retired'
      GROUP BY vehicle_type
    `);

    res.json({
      vehicles: metricsResult.rows,
      utilizationByType: utilizationResult.rows.map((row) => ({
        type: row.vehicle_type,
        total: parseInt(row.total),
        onTrip: parseInt(row.on_trip),
        utilizationRate: row.total > 0 ? (row.on_trip / row.total) * 100 : 0,
      })),
    });
  } catch (error) {
    console.error("Get fleet analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDriverPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        license_number,
        license_category,
        status,
        safety_score,
        total_trips,
        completed_trips,
        incident_free_streak_days,
        CASE 
          WHEN total_trips > 0 THEN (completed_trips::float / total_trips::float) * 100
          ELSE 0
        END as completion_rate
      FROM drivers
      ORDER BY safety_score DESC, completed_trips DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get driver performance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const exportCSV = async (req, res) => {
  // Placeholder - frontend will handle CSV generation
  res.json({ message: "CSV export endpoint (implement in frontend)" });
};

export const exportPDF = async (req, res) => {
  // Placeholder - frontend will handle PDF generation
  res.json({ message: "PDF export endpoint (implement in frontend)" });
};
