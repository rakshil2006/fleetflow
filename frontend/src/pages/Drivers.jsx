import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusPill } from "../components/ui/StatusPill";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import {
  formatDate,
  getLicenseExpiryStatus,
  getSafetyScoreColor,
} from "../utils/formatters";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [toast, setToast] = useState(null);
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    license_category: "Truck",
    license_expiry_date: "",
    safety_score: "100",
  });

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  const fetchDrivers = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/drivers", { params });
      setDrivers(response.data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      showToast("Failed to fetch drivers", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        email: driver.email || "",
        phone: driver.phone || "",
        license_number: driver.license_number,
        license_category: driver.license_category,
        license_expiry_date: driver.license_expiry_date.split("T")[0],
        safety_score: driver.safety_score,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        license_number: "",
        license_category: "Truck",
        license_expiry_date: "",
        safety_score: "100",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDriver(null);
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
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, formData);
        showToast("Driver updated successfully");
      } else {
        await api.post("/drivers", formData);
        showToast("Driver created successfully");
      }
      fetchDrivers();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to save driver",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (driverId, newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/drivers/${driverId}/status`, { status: newStatus });
      showToast("Driver status updated successfully");
      fetchDrivers();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to update status",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = (driver) => {
    if (driver.total_trips === 0) return 0;
    return ((driver.completed_trips / driver.total_trips) * 100).toFixed(1);
  };

  const canManage = hasPermission("manage_drivers");

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark-900">
            Driver Performance & Safety
          </h1>
          <p className="text-dark-600 mt-1">
            Monitor driver statistics and safety scores
          </p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Add Driver
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {["all", "on_duty", "on_trip", "off_duty", "suspended"].map(
            (status) => (
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
            ),
          )}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => {
            const licenseStatus = getLicenseExpiryStatus(
              driver.license_expiry_date,
            );
            const completionRate = getCompletionRate(driver);

            return (
              <Card
                key={driver.id}
                className="hover:border-primary-400 cursor-pointer">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-dark-900">
                          {driver.name}
                        </h3>
                        <p className="text-sm text-dark-500">
                          {driver.license_number}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={driver.status} />
                  </div>

                  {/* Safety Score */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-dark-700">
                        Safety Score
                      </span>
                      <span
                        className={`text-2xl font-bold ${getSafetyScoreColor(driver.safety_score)}`}>
                        {driver.safety_score}
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          driver.safety_score >= 90
                            ? "bg-success"
                            : driver.safety_score >= 70
                              ? "bg-warning"
                              : "bg-danger"
                        }`}
                        style={{ width: `${driver.safety_score}%` }}></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-100">
                    <div>
                      <p className="text-xs text-dark-500">Total Trips</p>
                      <p className="text-lg font-bold text-dark-900">
                        {driver.total_trips}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Completed</p>
                      <p className="text-lg font-bold text-dark-900">
                        {driver.completed_trips}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Completion Rate</p>
                      <p className="text-lg font-bold text-success">
                        {completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Streak Days</p>
                      <p className="text-lg font-bold text-accent-600">
                        {driver.incident_free_streak_days}
                      </p>
                    </div>
                  </div>

                  {/* License Info */}
                  <div className="pt-4 border-t border-primary-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-600">
                        License: {driver.license_category}
                      </span>
                      <span
                        className={`font-semibold ${
                          licenseStatus.status === "expired"
                            ? "text-danger"
                            : licenseStatus.status === "expiring"
                              ? "text-warning"
                              : "text-success"
                        }`}>
                        {licenseStatus.status === "expired"
                          ? "Expired"
                          : licenseStatus.status === "expiring"
                            ? `${licenseStatus.days} days left`
                            : "Valid"}
                      </span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1">
                      Expires: {formatDate(driver.license_expiry_date)}
                    </p>
                  </div>

                  {/* Achievements */}
                  {driver.incident_free_streak_days > 100 && (
                    <div className="flex items-center gap-2 p-2 bg-accent-50 rounded-lg">
                      <span className="text-2xl">🏆</span>
                      <span className="text-xs font-semibold text-accent-800">
                        Top Performer
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {canManage && (
                    <div className="flex gap-2 pt-4 border-t border-primary-100">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenModal(driver)}>
                        Edit
                      </Button>
                      {driver.status === "off_duty" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            handleStatusChange(driver.id, "on_duty")
                          }>
                          Set On Duty
                        </Button>
                      )}
                      {driver.status === "on_duty" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(driver.id, "off_duty")
                          }>
                          Set Off Duty
                        </Button>
                      )}
                      {driver.status !== "suspended" && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleStatusChange(driver.id, "suspended")
                          }>
                          Suspend
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && drivers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-dark-500">No drivers found</p>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Category *
                  </label>
                  <select
                    name="license_category"
                    value={formData.license_category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="license_expiry_date"
                    value={formData.license_expiry_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {editingDriver && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Safety Score
                    </label>
                    <input
                      type="number"
                      name="safety_score"
                      value={formData.safety_score}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
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
                  {editingDriver ? "Update Driver" : "Create Driver"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
