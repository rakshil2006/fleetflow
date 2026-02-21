import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { hasPermission } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊", permission: "view_dashboard" },
    {
      path: "/vehicles",
      label: "Vehicles",
      icon: "🚛",
      permission: "view_vehicles",
    },
    {
      path: "/drivers",
      label: "Drivers",
      icon: "👤",
      permission: "view_drivers",
    },
    { path: "/trips", label: "Trips", icon: "🗺️", permission: "view_trips" },
    {
      path: "/maintenance",
      label: "Maintenance",
      icon: "🔧",
      permission: "view_maintenance",
    },
    {
      path: "/fuel-expenses",
      label: "Fuel & Expenses",
      icon: "⛽",
      permission: "view_fuel",
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: "📈",
      permission: "view_analytics",
    },
  ];

  return (
    <>
      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:block fixed top-4 z-[60] p-2 rounded-xl bg-white border border-primary-200 hover:bg-primary-50 transition-all"
        style={{ left: isOpen ? "240px" : "16px" }}>
        <svg
          className="w-5 h-5 text-primary-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-xl bg-white border border-primary-200">
        <svg
          className="w-6 h-6 text-primary-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm border-r border-primary-200 z-40
        transform transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "lg:w-64" : "lg:w-0 lg:border-r-0"}
        ${isMobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"}
      `}>
        <div className={`w-64 ${isOpen ? "" : "lg:hidden"}`}>
          <div className="p-6 border-b border-primary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold gradient-text">
                  FleetFlow
                </h1>
                <p className="text-xs text-dark-500">Fleet Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              if (!hasPermission(item.permission)) return null;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white"
                        : "text-dark-700 hover:bg-primary-50 hover:text-primary-800"
                    }`
                  }
                  title={item.label}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-200 bg-white/50">
            <div className="text-xs text-center text-dark-500">
              <p className="font-semibold">FleetFlow v1.0</p>
              <p>Premium Edition</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
