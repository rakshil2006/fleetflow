import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../utils/formatters";

const Analytics = () => {
  const [fleetData, setFleetData] = useState(null);
  const [driverData, setDriverData] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fleet");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [fleetRes, driverRes] = await Promise.all([
        api.get("/analytics/fleet"),
        api.get("/analytics/drivers"),
      ]);
      setFleetData(fleetRes.data);
      setDriverData(driverRes.data);
      calculateFinancialMetrics(fleetRes.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialMetrics = (data) => {
    if (!data?.vehicles) return;

    const totalFuelCost = data.vehicles.reduce(
      (sum, v) => sum + parseFloat(v.fuel_cost || 0),
      0,
    );
    const totalMaintenanceCost = data.vehicles.reduce(
      (sum, v) => sum + parseFloat(v.maintenance_cost || 0),
      0,
    );
    const totalRevenue = data.vehicles.reduce(
      (sum, v) => sum + parseFloat(v.revenue || 0),
      0,
    );
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOperationalCost;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const vehiclesWithROI = data.vehicles.map((v) => {
      const costs =
        parseFloat(v.fuel_cost || 0) + parseFloat(v.maintenance_cost || 0);
      const revenue = parseFloat(v.revenue || 0);
      const profit = revenue - costs;
      const roi = costs > 0 ? (profit / costs) * 100 : 0;
      const costPerTrip = v.total_trips > 0 ? costs / v.total_trips : 0;
      const revenuePerTrip = v.total_trips > 0 ? revenue / v.total_trips : 0;

      return {
        ...v,
        totalCosts: costs,
        profit,
        roi,
        costPerTrip,
        revenuePerTrip,
      };
    });

    const topPerformers = [...vehiclesWithROI]
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);
    const bottomPerformers = [...vehiclesWithROI]
      .sort((a, b) => a.roi - b.roi)
      .slice(0, 5);

    setFinancialData({
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost,
      totalRevenue,
      netProfit,
      profitMargin,
      vehiclesWithROI,
      topPerformers,
      bottomPerformers,
    });
  };

  const exportToCSV = () => {
    if (!fleetData?.vehicles) return;

    const headers = [
      "Vehicle",
      "Type",
      "Status",
      "Fuel Cost",
      "Maintenance Cost",
      "Total Costs",
      "Revenue",
      "Profit",
      "ROI %",
      "Trips",
      "Cost/Trip",
      "Revenue/Trip",
    ];

    const rows = financialData.vehiclesWithROI.map((v) => [
      v.name,
      v.vehicle_type,
      v.status,
      v.fuel_cost,
      v.maintenance_cost,
      v.totalCosts.toFixed(2),
      v.revenue,
      v.profit.toFixed(2),
      v.roi.toFixed(2),
      v.total_trips,
      v.costPerTrip.toFixed(2),
      v.revenuePerTrip.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark-900">
            Analytics & Financial Reports
          </h1>
          <p className="text-dark-600 mt-1">
            Comprehensive fleet performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="accent" onClick={exportToCSV}>
            📊 Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-2 border-b border-primary-200 pb-4">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "fleet"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}>
            🚛 Fleet Overview
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "financial"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}>
            💰 Financial Analysis
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "drivers"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}>
            👥 Driver Performance
          </button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {activeTab === "fleet" && (
            <>
              <Card>
                <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                  Fleet Overview
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Vehicle
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Fuel Cost
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Maintenance
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Revenue
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Trips
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetData?.vehicles?.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="py-3 px-4 font-semibold text-dark-900">
                            {vehicle.name}
                          </td>
                          <td className="py-3 px-4">{vehicle.vehicle_type}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                vehicle.status === "available"
                                  ? "bg-success/20 text-success"
                                  : vehicle.status === "on_trip"
                                    ? "bg-accent-100 text-accent-800"
                                    : vehicle.status === "in_shop"
                                      ? "bg-warning/20 text-warning"
                                      : "bg-dark-200 text-dark-700"
                              }`}>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-warning font-semibold">
                            {formatCurrency(vehicle.fuel_cost)}
                          </td>
                          <td className="py-3 px-4 text-danger font-semibold">
                            {formatCurrency(vehicle.maintenance_cost)}
                          </td>
                          <td className="py-3 px-4 text-success font-bold">
                            {formatCurrency(vehicle.revenue)}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {vehicle.total_trips}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {fleetData?.utilizationByType && (
                <Card>
                  <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                    Fleet Utilization by Type
                  </h2>
                  <div className="space-y-4">
                    {fleetData.utilizationByType.map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-dark-900">
                            {item.type}
                          </span>
                          <span className="text-sm text-dark-600">
                            {item.onTrip} / {item.total} vehicles (
                            {item.utilizationRate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-dark-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                            style={{ width: `${item.utilizationRate}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === "financial" && financialData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-dark-600 font-semibold mb-2">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-success">
                      {formatCurrency(financialData.totalRevenue)}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-dark-600 font-semibold mb-2">
                      Operational Costs
                    </p>
                    <p className="text-3xl font-bold text-danger">
                      {formatCurrency(financialData.totalOperationalCost)}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-dark-600 font-semibold mb-2">
                      Net Profit
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        financialData.netProfit >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}>
                      {formatCurrency(financialData.netProfit)}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-dark-600 font-semibold mb-2">
                      Profit Margin
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        financialData.profitMargin >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}>
                      {financialData.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </Card>
              </div>

              <Card>
                <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                  Cost Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-dark-900">
                        Fuel Costs
                      </span>
                      <span className="text-lg font-bold text-warning">
                        {formatCurrency(financialData.totalFuelCost)}
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-warning"
                        style={{
                          width: `${
                            (financialData.totalFuelCost /
                              financialData.totalOperationalCost) *
                            100
                          }%`,
                        }}></div>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">
                      {(
                        (financialData.totalFuelCost /
                          financialData.totalOperationalCost) *
                        100
                      ).toFixed(1)}
                      % of operational costs
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-dark-900">
                        Maintenance Costs
                      </span>
                      <span className="text-lg font-bold text-danger">
                        {formatCurrency(financialData.totalMaintenanceCost)}
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-danger"
                        style={{
                          width: `${
                            (financialData.totalMaintenanceCost /
                              financialData.totalOperationalCost) *
                            100
                          }%`,
                        }}></div>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">
                      {(
                        (financialData.totalMaintenanceCost /
                          financialData.totalOperationalCost) *
                        100
                      ).toFixed(1)}
                      % of operational costs
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                  🏆 Top Performers by ROI
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Vehicle
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Revenue
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Costs
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Profit
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          ROI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.topPerformers.map((vehicle, index) => (
                        <tr
                          key={vehicle.id}
                          className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {index === 0
                                  ? "🥇"
                                  : index === 1
                                    ? "🥈"
                                    : index === 2
                                      ? "🥉"
                                      : ""}
                              </span>
                              <span className="font-semibold text-dark-900">
                                {vehicle.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-success font-semibold">
                            {formatCurrency(vehicle.revenue)}
                          </td>
                          <td className="py-3 px-4 text-danger font-semibold">
                            {formatCurrency(vehicle.totalCosts)}
                          </td>
                          <td className="py-3 px-4 font-bold text-success">
                            {formatCurrency(vehicle.profit)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-success/20 text-success rounded-lg font-bold">
                              {vehicle.roi.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="border-warning">
                <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                  ⚠️ Vehicles Needing Attention
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Vehicle
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Revenue
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Costs
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Profit/Loss
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          ROI
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-dark-700">
                          Recommendation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.bottomPerformers.map((vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="border-b border-primary-100 hover:bg-warning/5">
                          <td className="py-3 px-4 font-semibold text-dark-900">
                            {vehicle.name}
                          </td>
                          <td className="py-3 px-4 text-success font-semibold">
                            {formatCurrency(vehicle.revenue)}
                          </td>
                          <td className="py-3 px-4 text-danger font-semibold">
                            {formatCurrency(vehicle.totalCosts)}
                          </td>
                          <td
                            className={`py-3 px-4 font-bold ${
                              vehicle.profit >= 0
                                ? "text-success"
                                : "text-danger"
                            }`}>
                            {formatCurrency(vehicle.profit)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-lg font-bold ${
                                vehicle.roi >= 0
                                  ? "bg-warning/20 text-warning"
                                  : "bg-danger/20 text-danger"
                              }`}>
                              {vehicle.roi.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-dark-600">
                            {vehicle.roi < -50
                              ? "Consider retiring"
                              : vehicle.roi < 0
                                ? "Reduce costs"
                                : "Increase utilization"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {activeTab === "drivers" && (
            <Card>
              <h2 className="text-xl font-serif font-bold text-dark-900 mb-6">
                Driver Performance Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Driver
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        License
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Safety Score
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Total Trips
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Completed
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Completion Rate
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverData.map((driver) => (
                      <tr
                        key={driver.id}
                        className="border-b border-primary-100 hover:bg-primary-50">
                        <td className="py-3 px-4 font-semibold text-dark-900">
                          {driver.name}
                        </td>
                        <td className="py-3 px-4 text-dark-600">
                          {driver.license_category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              driver.safety_score >= 90
                                ? "text-success"
                                : driver.safety_score >= 70
                                  ? "text-warning"
                                  : "text-danger"
                            }`}>
                            {driver.safety_score}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {driver.total_trips}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {driver.completed_trips}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-dark-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-success"
                                style={{
                                  width: `${driver.completion_rate}%`,
                                }}></div>
                            </div>
                            <span className="text-sm font-semibold text-success">
                              {driver.completion_rate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-lg text-xs font-semibold">
                            {driver.incident_free_streak_days} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
