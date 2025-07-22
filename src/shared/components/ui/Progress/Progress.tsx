import React from "react";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressVariant = "default" | "success" | "warning" | "error";

export interface ProgressProps {
  value?: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showValue?: boolean;
  label?: string;
  indeterminate?: boolean;
  className?: string;
  formatValue?: (value: number, max: number) => string;
}

// ================================================================
// MAIN PROGRESS COMPONENT
// ================================================================

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  size = "md",
  variant = "default",
  showValue = false,
  label,
  indeterminate = false,
  className = "",
  formatValue,
}) => {
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

  const progressClasses = [
    "dm-progress",
    `dm-progress-${size}`,
    `dm-progress-${variant}`,
    indeterminate ? "dm-progress-indeterminate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getValueText = () => {
    if (formatValue) {
      return formatValue(clampedValue, max);
    }
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className="dm-progress-wrapper">
      {/* Label and value */}
      {(label || showValue) && (
        <div className="dm-progress-header">
          {label && <span className="dm-progress-label">{label}</span>}
          {showValue && !indeterminate && (
            <span className="dm-progress-value">{getValueText()}</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={progressClasses}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={indeterminate ? "Loading..." : getValueText()}
        aria-label={label || "Progress"}
      >
        <div className="dm-progress-track">
          {indeterminate ? (
            <div className="dm-progress-indeterminate-bar" />
          ) : (
            <div
              className="dm-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
