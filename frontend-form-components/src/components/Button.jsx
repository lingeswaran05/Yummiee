function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  className = "",
}) {
  const baseStyles =
    "rounded-xl px-5 py-3 font-semibold transition-all duration-200 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-dark",
    secondary:
      "bg-secondary text-white hover:opacity-90",
    outline:
      "border border-border bg-transparent text-text-primary hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;