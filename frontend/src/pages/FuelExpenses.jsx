import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate } from "../utils/formatters";

const FuelExpenses = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fuel");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("fuel");
  const [toast, setToast] = useState(null);
  const { hasPermission } = useAuth();

  const [fuelFormData, setFuelFormData] = useState({
    vehicle_id: "",
    liters: "",
    cost_per_liter: "",
    total_cost: "",
    odometer_at_fill: "",
    fuel_date: new Date().toISOString().split("T")[0],
  });

  const [expenseFormData, setExpenseFormData] = useState({
    vehicle_id: "",
    category: "Tolls",
    amount: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fuelRes, expenseRes] = await Promise.all([
        api.get("/fuel"),
        api.get("/expenses"),
      ]);
      setFuelLogs(fuelRes.data);
      setExpenseLogs(expenseRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Failed to fetch data", "error");
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

  const handleOpenModal = async (type) => {
    await fetchVehicles();
    setModalType(type);
    if (type === "fuel") {
      setFuelFormData({
        vehicle_id: "",
        liters: "",
        cost_per_liter: "",
        total_cost: "",
        odometer_at_fill: "",
        fuel_date: new Date().toISOString().split("T")[0],
      });
    } else {
      setExpenseFormData({
        vehicle_id: "",
        category: "Tolls",
        amount: "",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFuelChange = (e) => {
    const newData = {
      ...fuelFormData,
      [e.target.name]: e.target.value,
    };

    // Auto-calculate total cost
    if (e.target.name === "liters" || e.target.name === "cost_per_liter") {
      const liters = parseFloat(newData.liters) || 0;
      const costPerLiter = parseFloat(newData.cost_per_liter) || 0;
      newData.total_cost = (liters * costPerLiter).toFixed(2);
    }

    setFuelFormData(newData);
  };

  const handleExpenseChange = (e) => {
    setExpenseFormData({
      ...expenseFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/fuel", fuelFormData);
      showToast("Fuel log created successfully");
      fetchData();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create fuel log",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/expenses", expenseFormData);
      showToast("Expense log created successfully");
      fetchData();
      handleCloseModal();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create expense log",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalFuelCost = fuelLogs.reduce(
    (sum, log) => sum + parseFloat(log.total_cost || 0),
    0,
  );
  const totalExpenses = expenseLogs.reduce(
    (sum, log) => sum + parseFloat(log.amount || 0),
    0,
  );
  const totalOperationalCost = totalFuelCost + totalExpenses;

  const canManage = hasPermission("manage_fuel");

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark-900">
            Fuel & Expense Logging
          </h1>
          <p className="text-dark-600 mt-1">
            Track fuel consumption and operational expenses
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => handleOpenModal("fuel")}>
              + Add Fuel Log
            </Button>
            <Button variant="accent" onClick={() => handleOpenModal("expense")}>
              + Add Expense
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-dark-600 font-semibold mb-2">
              Total Fuel Cost
            </p>
            <p className="text-3xl font-bold text-warning">
              {formatCurrency(totalFuelCost)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-dark-600 font-semibold mb-2">
              Total Expenses
            </p>
            <p className="text-3xl font-bold text-danger">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-dark-600 font-semibold mb-2">
              Total Operational Cost
            </p>
            <p className="text-3xl font-bold text-primary-700">
              {formatCurrency(totalOperationalCost)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex gap-2 border-b border-primary-200 pb-4">
          <button
            onClick={() => setActiveTab("fuel")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "fuel"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}>
            ⛽ Fuel Logs ({fuelLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "expenses"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}>
            💰 Expense Logs ({expenseLogs.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="mt-6">
            {activeTab === "fuel" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Liters
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Cost/Liter
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Total Cost
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Odometer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-primary-100 hover:bg-primary-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-dark-900">
                              {log.vehicle_name}
                            </p>
                            <p className="text-xs text-dark-500">
                              {log.license_plate}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {log.liters} L
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(log.cost_per_liter)}
                        </td>
                        <td className="py-3 px-4 font-bold text-warning">
                          {formatCurrency(log.total_cost)}
                        </td>
                        <td className="py-3 px-4">{log.odometer_at_fill} km</td>
                        <td className="py-3 px-4 text-dark-600">
                          {formatDate(log.fuel_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fuelLogs.length === 0 && (
                  <p className="text-center py-8 text-dark-500">
                    No fuel logs found
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Vehicle
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-dark-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-primary-100 hover:bg-primary-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-dark-900">
                              {log.vehicle_name}
                            </p>
                            <p className="text-xs text-dark-500">
                              {log.license_plate}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-lg text-xs font-semibold">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-700">
                          {log.description}
                        </td>
                        <td className="py-3 px-4 font-bold text-danger">
                          {formatCurrency(log.amount)}
                        </td>
                        <td className="py-3 px-4 text-dark-600">
                          {formatDate(log.expense_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenseLogs.length === 0 && (
                  <p className="text-center py-8 text-dark-500">
                    No expense logs found
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalType === "fuel" ? "Add Fuel Log" : "Add Expense Log"}
              </h2>
            </div>

            {modalType === "fuel" ? (
              <form onSubmit={handleFuelSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle *
                    </label>
                    <select
                      name="vehicle_id"
                      value={fuelFormData.vehicle_id}
                      onChange={handleFuelChange}
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
                      Liters *
                    </label>
                    <input
                      type="number"
                      name="liters"
                      value={fuelFormData.liters}
                      onChange={handleFuelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cost per Liter *
                    </label>
                    <input
                      type="number"
                      name="cost_per_liter"
                      value={fuelFormData.cost_per_liter}
                      onChange={handleFuelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Cost
                    </label>
                    <input
                      type="number"
                      name="total_cost"
                      value={fuelFormData.total_cost}
                      onChange={handleFuelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Odometer at Fill (km) *
                    </label>
                    <input
                      type="number"
                      name="odometer_at_fill"
                      value={fuelFormData.odometer_at_fill}
                      onChange={handleFuelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fuel Date *
                    </label>
                    <input
                      type="date"
                      name="fuel_date"
                      value={fuelFormData.fuel_date}
                      onChange={handleFuelChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
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
                    Create Fuel Log
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle *
                    </label>
                    <select
                      name="vehicle_id"
                      value={expenseFormData.vehicle_id}
                      onChange={handleExpenseChange}
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
                      Category *
                    </label>
                    <select
                      name="category"
                      value={expenseFormData.category}
                      onChange={handleExpenseChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required>
                      <option value="Tolls">Tolls</option>
                      <option value="Parking">Parking</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Registration">Registration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseFormData.amount}
                      onChange={handleExpenseChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      name="expense_date"
                      value={expenseFormData.expense_date}
                      onChange={handleExpenseChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={expenseFormData.description}
                      onChange={handleExpenseChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="3"
                      required
                      placeholder="Details about the expense..."></textarea>
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
                    variant="accent"
                    className="flex-1"
                    disabled={loading}>
                    Create Expense Log
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelExpenses;
