import React from "react";

export type ActionButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "magic"
  | "combat"
  | "social"
  | "utility";

export type ActionButtonSize = "xs" | "sm" | "md" | "lg";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = [
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    "transform hover:scale-105 active:scale-95",
  ].join(" ");

  // Size variations
  const sizeClasses = {
    xs: "px-2 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  // D&D themed variant colors
  const variantClasses = {
    primary: [
      "bg-blue-600 text-white border border-blue-600",
      "hover:bg-blue-700 hover:border-blue-700",
      "focus:ring-blue-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    secondary: [
      "bg-white text-gray-700 border border-gray-300",
      "hover:bg-gray-50 hover:border-gray-400",
      "focus:ring-gray-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    success: [
      "bg-green-600 text-white border border-green-600",
      "hover:bg-green-700 hover:border-green-700",
      "focus:ring-green-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    warning: [
      "bg-amber-600 text-white border border-amber-600",
      "hover:bg-amber-700 hover:border-amber-700",
      "focus:ring-amber-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    danger: [
      "bg-red-600 text-white border border-red-600",
      "hover:bg-red-700 hover:border-red-700",
      "focus:ring-red-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    info: [
      "bg-cyan-600 text-white border border-cyan-600",
      "hover:bg-cyan-700 hover:border-cyan-700",
      "focus:ring-cyan-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),

    // D&D specific themes
    magic: [
      "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-600",
      "hover:from-purple-700 hover:to-indigo-700",
      "focus:ring-purple-500",
      "shadow-lg hover:shadow-xl",
    ].join(" "),

    combat: [
      "bg-gradient-to-r from-red-600 to-orange-600 text-white border border-red-600",
      "hover:from-red-700 hover:to-orange-700",
      "focus:ring-red-500",
      "shadow-lg hover:shadow-xl",
    ].join(" "),

    social: [
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-600",
      "hover:from-emerald-700 hover:to-teal-700",
      "focus:ring-emerald-500",
      "shadow-lg hover:shadow-xl",
    ].join(" "),

    utility: [
      "bg-slate-600 text-white border border-slate-600",
      "hover:bg-slate-700 hover:border-slate-700",
      "focus:ring-slate-500",
      "shadow-sm hover:shadow-md",
    ].join(" "),
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClass,
    className,
  ].join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Caricamento...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;

// Predefined action buttons per azioni D&D comuni
export const CreateButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="success" {...props} />;

export const EditButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="warning" {...props} />;

export const DeleteButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="danger" {...props} />;

export const LevelUpButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="magic" icon={<span>⬆️</span>} {...props} />;

export const CombatButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="combat" icon={<span>⚔️</span>} {...props} />;

export const SocialButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="social" icon={<span>💬</span>} {...props} />;

export const DiceButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => <ActionButton variant="utility" icon={<span>🎲</span>} {...props} />;

export const AchievementButton: React.FC<Omit<ActionButtonProps, "variant">> = (
  props
) => (
  <ActionButton variant="info" icon={<span>🏆</span>} size="sm" {...props} />
);

export const RelationshipButton: React.FC<
  Omit<ActionButtonProps, "variant">
> = (props) => (
  <ActionButton variant="social" icon={<span>👥</span>} size="sm" {...props} />
);
