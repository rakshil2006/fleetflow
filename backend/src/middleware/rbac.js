// Role-Based Access Control Middleware

const permissions = {
  fleet_manager: ["*"], // Full access
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
    "view_drivers",
    "view_trips",
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

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res
        .status(403)
        .json({ error: "Access denied. No role assigned." });
    }

    const userPermissions = permissions[userRole];

    if (!userPermissions) {
      return res.status(403).json({ error: "Access denied. Invalid role." });
    }

    // Fleet manager has full access
    if (
      userPermissions.includes("*") ||
      userPermissions.includes(requiredPermission)
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ error: "Access denied. Insufficient permissions." });
  };
};
