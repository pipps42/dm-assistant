import React from "react";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  | "dot";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  pill?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  onClick?: () => void;
}

// ================================================================
// MAIN BADGE COMPONENT
// ================================================================

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  icon,
  pill = false,
  removable = false,
  onRemove,
  className = "",
  onClick,
}) => {
  const isClickable = !!onClick;
  const isDot = variant === "dot";

  const badgeClasses = [
    "dm-badge",
    `dm-badge-${variant}`,
    `dm-badge-${size}`,
    pill ? "dm-badge-pill" : "",
    isClickable ? "dm-badge-clickable" : "",
    isDot ? "dm-badge-dot" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  // Dot variant - just a colored circle
  if (isDot) {
    return (
      <span
        className={badgeClasses}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={
          typeof children === "string" ? children : "Status indicator"
        }
      />
    );
  }

  const BadgeElement = isClickable ? "button" : "span";

  return (
    <BadgeElement
      className={badgeClasses}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      type={isClickable ? "button" : undefined}
    >
      {/* Icon */}
      {icon && <span className="dm-badge-icon">{icon}</span>}

      {/* Content */}
      {children && <span className="dm-badge-content">{children}</span>}

      {/* Remove button */}
      {removable && (
        <button
          className="dm-badge-remove"
          onClick={handleRemove}
          aria-label="Remove"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M9 3L3 9M3 3l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </BadgeElement>
  );
};

export default Badge;
