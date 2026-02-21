import { getStatusColor } from "../../utils/formatters";

export const StatusPill = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
