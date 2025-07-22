import React from "react";

export type LoadingSize = "sm" | "md" | "lg" | "xl";
export type LoadingVariant = "spinner" | "pulse" | "dots";

export interface SpinnerProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: "primary" | "secondary" | "white";
  className?: string;
}

export interface LoadingProps extends SpinnerProps {
  text?: string;
  description?: string;
  centered?: boolean;
}

export interface LoadingOverlayProps extends LoadingProps {
  isVisible: boolean;
  blur?: boolean;
  children?: React.ReactNode;
}

export interface LoadingButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  size?: LoadingSize;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

// ================================================================
// SPINNER COMPONENT
// ================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "spinner",
  color = "primary",
  className = "",
}) => {
  const spinnerClasses = [
    "dm-spinner",
    `dm-spinner-${size}`,
    `dm-spinner-${variant}`,
    `dm-spinner-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "dots") {
    return (
      <div className={spinnerClasses} role="status" aria-label="Loading">
        <div className="dm-spinner-dot"></div>
        <div className="dm-spinner-dot"></div>
        <div className="dm-spinner-dot"></div>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={spinnerClasses} role="status" aria-label="Loading">
        <div className="dm-spinner-pulse"></div>
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <svg
        className="dm-spinner-svg"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="dm-spinner-track"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <circle
          className="dm-spinner-fill"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        />
      </svg>
    </div>
  );
};

// ================================================================
// MAIN LOADING COMPONENT
// ================================================================

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  color = "primary",
  text,
  description,
  centered = false,
  className = "",
}) => {
  const loadingClasses = [
    "dm-loading",
    `dm-loading-${size}`,
    centered ? "dm-loading-centered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={loadingClasses}>
      <Spinner size={size} variant={variant} color={color} />

      {(text || description) && (
        <div className="dm-loading-content">
          {text && <div className="dm-loading-text">{text}</div>}
          {description && (
            <div className="dm-loading-description">{description}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loading;

// ================================================================
// LOADING OVERLAY COMPONENT
// ================================================================

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  blur = true,
  children,
  size = "lg",
  variant = "spinner",
  color = "primary",
  text = "Loading...",
  description,
  className = "",
}) => {
  if (!isVisible) {
    return <>{children}</>;
  }

  const overlayClasses = [
    "dm-loading-overlay",
    blur ? "dm-loading-overlay-blur" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="dm-loading-overlay-container">
      {children && <div className="dm-loading-overlay-content">{children}</div>}

      <div className={overlayClasses}>
        <Loading
          size={size}
          variant={variant}
          color={color}
          text={text}
          description={description}
          centered
        />
      </div>
    </div>
  );
};

// ================================================================
// LOADING BUTTON COMPONENT
// ================================================================

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText,
  disabled = false,
  size = "md",
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}) => {
  const buttonClasses = [
    "dm-loading-button",
    `dm-loading-button-${size}`,
    `dm-loading-button-${variant}`,
    isLoading ? "dm-loading-button-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (!isLoading && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || isLoading}
      type={type}
      aria-disabled={disabled || isLoading}
    >
      {isLoading && (
        <Spinner
          size={size === "sm" ? "sm" : "sm"}
          variant="spinner"
          color="white"
        />
      )}

      <span
        className={`dm-loading-button-text ${
          isLoading ? "dm-loading-button-text-loading" : ""
        }`}
      >
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
};
