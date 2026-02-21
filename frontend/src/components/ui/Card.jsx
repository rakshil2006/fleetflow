export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border border-primary-200 rounded-2xl p-6 hover:border-primary-300 transition-all ${className}`}
      {...props}>
      {children}
    </div>
  );
};
