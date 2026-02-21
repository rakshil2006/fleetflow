import { format, formatDistanceToNow } from "date-fns";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num || 0);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM dd, yyyy");
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "MMM dd, yyyy HH:mm");
};

export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getStatusColor = (status) => {
  const colors = {
    available: "bg-success text-white",
    on_trip: "bg-accent text-white",
    in_shop: "bg-warning text-white",
    retired: "bg-gray-400 text-white",
    off_duty: "bg-gray-400 text-white",
    on_duty: "bg-success text-white",
    suspended: "bg-danger text-white",
    draft: "bg-gray-400 text-white",
    dispatched: "bg-accent text-white",
    completed: "bg-success text-white",
    cancelled: "bg-danger text-white",
    in_progress: "bg-warning text-white",
  };
  return colors[status] || "bg-gray-400 text-white";
};

export const getLicenseExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { status: "unknown", color: "gray", days: 0 };

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "expired", color: "red", days: diffDays };
  } else if (diffDays < 30) {
    return { status: "expiring", color: "orange", days: diffDays };
  }
  return { status: "valid", color: "green", days: diffDays };
};

export const getSafetyScoreColor = (score) => {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-danger";
};
