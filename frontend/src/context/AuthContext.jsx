import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "fleet_manager") return true;

    const permissions = {
      dispatcher: [
        "view_dashboard",
        "view_vehicles",
        "view_drivers",
        "manage_trips",
        "view_trips",
        "view_fuel",
        "view_maintenance",
        "view_analytics",
      ],
      safety_officer: [
        "view_dashboard",
        "view_vehicles",
        "view_trips",
        "view_drivers",
        "manage_maintenance",
        "manage_drivers",
        "view_analytics",
      ],
      financial_analyst: [
        "view_dashboard",
        "view_vehicles",
        "view_trips",
        "view_maintenance",
        "view_drivers",
        "manage_fuel",
        "view_analytics",
        "export_reports",
      ],
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
