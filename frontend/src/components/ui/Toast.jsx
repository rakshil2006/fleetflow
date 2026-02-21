import { useEffect } from "react";

export const Toast = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-accent",
  };

  return (
    <div
      className={`fixed top-4 right-4 ${types[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};
