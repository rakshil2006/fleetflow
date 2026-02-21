import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import { KPICard } from "../components/ui/KPICard";
import { Card } from "../components/ui/Card";
import { formatCurrency, formatRelativeTime } from "../utils/formatters";

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchKPIs();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchKPIs();
    };

    socket.on("vehicle:status_updated", handleUpdate);
    socket.on("trip:created", handleUpdate);
    socket.on("trip:completed", handleUpdate);
    socket.on("maintenance:alert", handleUpdate);

    return () => {
      socket.off("vehicle:status_updated", handleUpdate);
      socket.off("trip:created", handleUpdate);
      socket.off("trip:completed", handleUpdate);
      socket.off("maintenance:alert", handleUpdate);
    };
  }, [socket]);

  const fetchKPIs = async () => {
    try {
      const response = await api.get("/analytics/dashboard");
      setKpis(response.data);
    } catch (error) {
      console.error("Failed to fetch KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Command Center</h1>
        <p className="text-gray-600 mt-1">
          Real-time fleet overview and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Fleet"
          value={kpis?.activeFleet || 0}
          icon="🚛"
          color="primary"
          loading={loading}
        />
        <KPICard
          title="Maintenance Alerts"
          value={kpis?.maintenanceAlerts || 0}
          icon="🔧"
          color="warning"
          loading={loading}
        />
        <KPICard
          title="Utilization Rate"
          value={`${kpis?.utilizationRate || 0}%`}
          icon="📊"
          color="success"
          loading={loading}
        />
        <KPICard
          title="Pending Cargo"
          value={kpis?.pendingCargo || 0}
          icon="📦"
          color="accent"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="font-semibold text-gray-800">
                {kpis?.totalVehicles || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Drivers</span>
              <span className="font-semibold text-gray-800">
                {kpis?.totalDrivers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Trips</span>
              <span className="font-semibold text-gray-800">
                {kpis?.activeTrips || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Fuel Cost</span>
              <span className="font-semibold text-gray-800">
                {formatCurrency(kpis?.monthlyFuelCost || 0)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {kpis?.recentActivity?.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-white/50 rounded">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {activity.type === "trip" ? "🗺️ Trip" : "🔧 Maintenance"} #
                    {activity.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {activity.status} •{" "}
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {(!kpis?.recentActivity || kpis.recentActivity.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
