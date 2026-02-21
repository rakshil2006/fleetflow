import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";

const Header = ({ isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const roleColors = {
    fleet_manager: "bg-gradient-to-r from-primary-600 to-primary-700",
    dispatcher: "bg-gradient-to-r from-accent-500 to-accent-600",
    safety_officer: "bg-gradient-to-r from-warning to-warning",
    financial_analyst: "bg-gradient-to-r from-success to-success",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`glass-card rounded-none border-b border-primary-200 px-4 py-3 sticky top-0 z-50 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64 lg:pl-20" : "lg:ml-0 lg:pl-20"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h2 className="text-lg font-serif font-bold text-dark-900">
              Welcome, <span className="gradient-text">{user?.name}</span>
            </h2>
            <p className="text-xs text-dark-500">
              Manage your fleet operations
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${roleColors[user?.role]}`}>
            {user?.role?.replace("_", " ").toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50">
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-danger"} animate-pulse`}></div>
            <span className="text-xs font-medium text-dark-700">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-primary-50 transition-colors">
            <svg
              className="w-6 h-6 text-dark-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-dark-900">
                {user?.name}
              </p>
              <p className="text-xs text-dark-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border-2 border-primary-600 text-primary-700 font-semibold hover:bg-primary-50 transition-all text-sm">
            <span className="hidden md:inline">Logout</span>
            <svg
              className="w-5 h-5 md:hidden"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
