import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StatusPill } from "../components/ui/StatusPill";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/ui/Toast";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [toast, setToast] = useState(null);
  const { hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    license_plate: "",
    vehicle_type: "Truck",
    max_load_capacity_kg: "",
    odometer_km: "0",
    region: "",
    acquisition_cost: "",
    status: "available",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      showToast("Failed to fetch vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name,
        model: vehicle.model || "",
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        max_load_capacity_kg: vehicle.max_load_capacity_kg,
        odometer_km: vehicle.odometer_km,
        region: vehicle.region || "",
        acquisition_cost: vehicle.acquisition_cost || "",
        status: vehicle.status,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        name: "",
        model: "",
        license_plate: "",
        vehicle_type: "Truck",
        max_load_capacity_kg: "",
        odometer_km: "0",
        region: "",
        acquisition_cost: "",
        status: "available",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
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
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, formData);
        showToast("Vehicle updated successfully");
      } else {
        await api.post("/vehicles", formData);
        showToast("Vehicle created successfully");
      }
      fetchVehicles();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to save vehicle",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    setLoading(true);
    try {
      await api.delete(`/vehicles/${id}`);
      showToast("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to delete vehicle",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetire = async (id) => {
    if (!confirm("Are you sure you want to retire this vehicle?")) return;

    setLoading(true);
    try {
      await api.patch(`/vehicles/${id}/retire`);
      showToast("Vehicle retired successfully");
      fetchVehicles();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to retire vehicle",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const canManage = hasPermission("manage_vehicles");

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Registry</h1>
          <p className="text-gray-600 mt-1">Manage your fleet vehicles</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Add Vehicle
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    License Plate
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Max Load (kg)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Odometer (km)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Region
                  </th>
                  {canManage && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-gray-100 hover:bg-white/50">
                    <td className="py-3 px-4">{vehicle.name}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {vehicle.license_plate}
                    </td>
                    <td className="py-3 px-4">{vehicle.vehicle_type}</td>
                    <td className="py-3 px-4">
                      {vehicle.max_load_capacity_kg}
                    </td>
                    <td className="py-3 px-4">{vehicle.odometer_km}</td>
                    <td className="py-3 px-4">
                      <StatusPill status={vehicle.status} />
                    </td>
                    <td className="py-3 px-4">{vehicle.region}</td>
                    {canManage && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(vehicle)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                            Edit
                          </button>
                          {vehicle.status !== "retired" && (
                            <button
                              onClick={() => handleRetire(vehicle.id)}
                              className="text-warning hover:text-warning/80 text-sm font-medium">
                              Retire
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-danger hover:text-danger/80 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No vehicles found
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
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
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
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
                    Max Load Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    name="max_load_capacity_kg"
                    value={formData.max_load_capacity_kg}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    name="odometer_km"
                    value={formData.odometer_km}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Acquisition Cost
                  </label>
                  <input
                    type="number"
                    name="acquisition_cost"
                    value={formData.acquisition_cost}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                {editingVehicle && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="in_shop">In Shop</option>
                      <option value="retired">Retired</option>
                    </select>
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
                  {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
