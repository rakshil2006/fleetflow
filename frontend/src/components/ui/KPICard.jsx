import { Card } from "./Card";

export const KPICard = ({
  title,
  value,
  icon,
  color = "primary",
  trend,
  loading = false,
  subtitle,
}) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-700",
    accent: "from-accent-500 to-accent-700",
    success: "from-success to-success",
    warning: "from-warning to-warning",
    danger: "from-danger to-danger",
  };

  return (
    <Card className="animate-fade-in hover:scale-105 cursor-pointer overflow-hidden relative">
      {/* Background gradient */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -mr-16 -mt-16`}></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-dark-600 uppercase tracking-wide">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-dark-400 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && <div className={`text-4xl opacity-20`}>{icon}</div>}
        </div>

        {loading ? (
          <div className="h-10 w-32 bg-dark-200 animate-pulse rounded-lg"></div>
        ) : (
          <div>
            <p
              className={`text-4xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent animate-count-up`}>
              {value}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <svg
                    className="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : trend < 0 ? (
                  <svg
                    className="w-4 h-4 text-danger"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                ) : null}
                <span
                  className={`text-sm font-semibold ${trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-dark-500"}`}>
                  {Math.abs(trend)}%{" "}
                  {trend > 0
                    ? "increase"
                    : trend < 0
                      ? "decrease"
                      : "no change"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
