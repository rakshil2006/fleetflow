import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusPill } from "../components/ui/StatusPill";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    driver_id: "",
    origin: "",
    destination: "",
    cargo_description: "",
    cargo_weight_kg: "",
    revenue: "",
  });

  const [completeData, setCompleteData] = useState({
    end_odometer: "",
  });

  useEffect(() => {
    fetchTrips();
  }, [filter]);

  const fetchTrips = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/trips", { params });
      setTrips(response.data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      showToast("Failed to fetch trips", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.get("/vehicles", { params: { status: "available" } }),
        api.get("/drivers"),
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(
        driversRes.data.filter(
          (d) => d.status === "on_duty" || d.status === "off_duty",
        ),
      );
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      showToast("Failed to fetch available resources", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = async () => {
    await fetchAvailableResources();
    setFormData({
      vehicle_id: "",
      driver_id: "",
      origin: "",
      destination: "",
      cargo_description: "",
      cargo_weight_kg: "",
      revenue: "",
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
      await api.post("/trips", formData);
      showToast("Trip created successfully");
      fetchTrips();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create trip",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (tripId) => {
    if (!confirm("Are you sure you want to dispatch this trip?")) return;

    setLoading(true);
    try {
      await api.patch(`/trips/${tripId}/dispatch`);
      showToast("Trip dispatched successfully");
      fetchTrips();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to dispatch trip",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompleteModal = (trip) => {
    setSelectedTrip(trip);
    setCompleteData({ end_odometer: "" });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/trips/${selectedTrip.id}/complete`, completeData);
      showToast("Trip completed successfully");
      fetchTrips();
      setShowCompleteModal(false);
      setSelectedTrip(null);
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to complete trip",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (tripId) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;

    setLoading(true);
    try {
      await api.patch(`/trips/${tripId}/cancel`);
      showToast("Trip cancelled successfully");
      fetchTrips();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to cancel trip",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return "📝";
      case "dispatched":
        return "🚚";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  const canManage = hasPermission("manage_trips");
  const selectedVehicle = vehicles.find(
    (v) => v.id === parseInt(formData.vehicle_id),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark-900">
            Trip Dispatcher
          </h1>
          <p className="text-dark-600 mt-1">
            Create, dispatch, and manage trips
          </p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={handleOpenModal}>
            + Create Trip
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {["all", "draft", "dispatched", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                }`}>
                {status.toUpperCase()}
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
        <div className="grid grid-cols-1 gap-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:border-primary-400">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{getStatusIcon(trip.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-dark-900">
                        Trip #{trip.id}
                      </h3>
                      <StatusPill status={trip.status} />
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-dark-700">
                        <span className="font-semibold">Route:</span>
                        <span>{trip.origin}</span>
                        <span className="text-primary-600">→</span>
                        <span>{trip.destination}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-dark-600">
                        <span>
                          🚛 {trip.vehicle_name || "N/A"} ({trip.license_plate})
                        </span>
                        <span>👤 {trip.driver_name || "N/A"}</span>
                        <span>📦 {trip.cargo_weight_kg} kg</span>
                      </div>

                      {trip.cargo_description && (
                        <p className="text-dark-500 italic">
                          {trip.cargo_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(trip.revenue)}
                    </p>
                    <p className="text-xs text-dark-500">Revenue</p>
                  </div>

                  {trip.dispatched_at && (
                    <p className="text-xs text-dark-500">
                      Dispatched: {formatDateTime(trip.dispatched_at)}
                    </p>
                  )}

                  {trip.completed_at && (
                    <p className="text-xs text-success">
                      Completed: {formatDateTime(trip.completed_at)}
                    </p>
                  )}

                  {canManage && (
                    <div className="flex gap-2 mt-2">
                      {trip.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleDispatch(trip.id)}>
                            Dispatch
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancel(trip.id)}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {trip.status === "dispatched" && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleOpenCompleteModal(trip)}>
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancel(trip.id)}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && trips.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-dark-500">No trips found</p>
          </div>
        </Card>
      )}

      {/* Create Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Trip
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
                        {vehicle.name} ({vehicle.license_plate}) - Max:{" "}
                        {vehicle.max_load_capacity_kg}kg
                      </option>
                    ))}
                  </select>
                  {vehicles.length === 0 && (
                    <p className="text-xs text-danger mt-1">
                      No available vehicles
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Driver *
                  </label>
                  <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required>
                    <option value="">Select Driver</option>
                    {drivers
                      .filter(
                        (d) =>
                          !selectedVehicle ||
                          d.license_category === selectedVehicle.vehicle_type,
                      )
                      .map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.license_category})
                        </option>
                      ))}
                  </select>
                  {drivers.length === 0 && (
                    <p className="text-xs text-danger mt-1">
                      No available drivers
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Origin *
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cargo Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="cargo_weight_kg"
                    value={formData.cargo_weight_kg}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                  />
                  {selectedVehicle && formData.cargo_weight_kg && (
                    <p
                      className={`text-xs mt-1 ${
                        parseFloat(formData.cargo_weight_kg) >
                        selectedVehicle.max_load_capacity_kg
                          ? "text-danger"
                          : "text-success"
                      }`}>
                      Max capacity: {selectedVehicle.max_load_capacity_kg}kg
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Revenue
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cargo Description
                  </label>
                  <textarea
                    name="cargo_description"
                    value={formData.cargo_description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"></textarea>
                </div>
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
                  Create Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {showCompleteModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Complete Trip #{selectedTrip.id}
              </h2>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Odometer (km) *
                </label>
                <input
                  type="number"
                  value={completeData.end_odometer}
                  onChange={(e) =>
                    setCompleteData({ end_odometer: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  min={selectedTrip.start_odometer || 0}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start odometer: {selectedTrip.start_odometer} km
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="flex-1"
                  disabled={loading}>
                  Complete Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
