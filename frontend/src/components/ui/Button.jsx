export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white focus:ring-primary-500 shadow-primary-300",
    secondary:
      "bg-gradient-to-r from-dark-200 to-dark-300 hover:from-dark-300 hover:to-dark-400 text-dark-800 focus:ring-dark-400",
    success:
      "bg-gradient-to-r from-success to-success hover:opacity-90 text-white focus:ring-success",
    danger:
      "bg-gradient-to-r from-danger to-danger hover:opacity-90 text-white focus:ring-danger",
    warning:
      "bg-gradient-to-r from-warning to-warning hover:opacity-90 text-white focus:ring-warning",
    accent:
      "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white focus:ring-accent-500 shadow-accent-300",
    outline:
      "border-2 border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
