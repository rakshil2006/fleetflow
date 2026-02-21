import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusPill } from "../components/ui/StatusPill";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils/formatters";

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_type: "",
    description: "",
    cost: "",
    service_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/maintenance", { params });
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch maintenance logs:", error);
      showToast("Failed to fetch maintenance logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      showToast("Failed to fetch vehicles", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = async () => {
    await fetchVehicles();
    setFormData({
      vehicle_id: "",
      service_type: "",
      description: "",
      cost: "",
      service_date: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/maintenance", formData);
      showToast("Maintenance log created successfully");
      fetchLogs();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create maintenance log",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (logId) => {
    if (!confirm("Mark this maintenance as completed?")) return;

    setLoading(true);
    try {
      await api.patch(`/maintenance/${logId}/complete`);
      showToast("Maintenance completed successfully");
      fetchLogs();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to complete maintenance",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!confirm("Are you sure you want to delete this maintenance log?"))
      return;

    setLoading(true);
    try {
      await api.delete(`/maintenance/${logId}`);
      showToast("Maintenance log deleted successfully");
      fetchLogs();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to delete maintenance log",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const inProgressCount = logs.filter(
    (log) => log.status === "in_progress",
  ).length;

  const canManage = hasPermission("manage_maintenance");

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark-900">
            Maintenance & Service Logs
          </h1>
          <p className="text-dark-600 mt-1">
            Track vehicle maintenance and repairs
          </p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenModal}>
            + Add Service Log
          </Button>
        )}
      </div>

      {/* Alert Banner */}
      {inProgressCount > 0 && (
        <Card className="bg-warning/10 border-warning">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold text-warning">Active Maintenance</p>
              <p className="text-sm text-dark-700">
                {inProgressCount} vehicle(s) currently in shop
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {["all", "in_progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? "bg-primary-600 text-white"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}>
              {status.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {logs.map((log) => (
            <Card key={log.id} className="hover:border-primary-400">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-dark-900 text-lg">
                      {log.service_type}
                    </h3>
                    <p className="text-sm text-dark-600">
                      {log.vehicle_name} - {log.license_plate}
                    </p>
                  </div>
                  <StatusPill status={log.status} />
                </div>

                {/* Description */}
                {log.description && (
                  <p className="text-dark-700 text-sm">{log.description}</p>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-100">
                  <div>
                    <p className="text-xs text-dark-500">Service Date</p>
                    <p className="font-semibold text-dark-900">
                      {formatDate(log.service_date)}
                    </p>
                  </div>
                  {log.completed_date && (
                    <div>
                      <p className="text-xs text-dark-500">Completed</p>
                      <p className="font-semibold text-success">
                        {formatDate(log.completed_date)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-dark-500">Cost</p>
                    <p className="font-bold text-danger text-lg">
                      {formatCurrency(log.cost)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex gap-2 pt-4 border-t border-primary-100">
                    {log.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleComplete(log.id)}>
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(log.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && logs.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-dark-500">No maintenance logs found</p>
          </div>
        </Card>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Add Service Log
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle *
                  </label>
                  <select
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required>
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.license_plate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    placeholder="e.g., Oil Change, Tire Replacement"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost *
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    name="service_date"
                    value={formData.service_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="Details about the service..."></textarea>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning rounded-lg p-3">
                <p className="text-sm text-warning font-semibold">
                  ⚠️ Note: Vehicle will be automatically set to "In Shop" status
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}>
                  Create Service Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
