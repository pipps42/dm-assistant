import React, { forwardRef } from "react";

export type CheckboxVariant = "outlined" | "filled" | "ghost";
export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxState = "default" | "error" | "success" | "warning";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  state?: CheckboxState;
  label?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  indeterminate?: boolean;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = "outlined",
      size = "md",
      state = "default",
      label,
      helperText,
      errorText,
      indeterminate = false,
      containerClassName = "",
      className = "",
      disabled,
      required,
      children,
      ...props
    },
    ref
  ) => {
    // Determine actual state (error takes precedence)
    const actualState = errorText ? "error" : state;

    // Generate unique ID for label association
    const checkboxId =
      props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // CSS classes using design system tokens
    const containerClasses = [
      "dm-checkbox-container",
      `dm-checkbox-container-${size}`,
      disabled ? "dm-checkbox-container-disabled" : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const checkboxClasses = [
      "dm-checkbox",
      `dm-checkbox-${variant}`,
      `dm-checkbox-${size}`,
      `dm-checkbox-${actualState}`,
      disabled ? "dm-checkbox-disabled" : "",
      indeterminate ? "dm-checkbox-indeterminate" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      "dm-checkbox-label",
      disabled ? "dm-checkbox-label-disabled" : "",
      actualState === "error" ? "dm-checkbox-label-error" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const helperTextClasses = [
      "dm-checkbox-helper",
      `dm-checkbox-helper-${actualState}`,
    ]
      .filter(Boolean)
      .join(" ");

    // Set indeterminate property
    React.useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className={containerClasses}>
        <div className="dm-checkbox-input-container">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxClasses}
            disabled={disabled}
            required={required}
            aria-describedby={
              helperText || errorText ? `${checkboxId}-helper` : undefined
            }
            aria-invalid={actualState === "error"}
            {...props}
          />

          {/* Custom checkbox visual */}
          <div className="dm-checkbox-visual">
            <svg
              className="dm-checkbox-check"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {indeterminate ? (
                <path
                  d="M4 8h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M13 4L6 11L3 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Label and content */}
        {(label || children) && (
          <div className="dm-checkbox-content">
            {label && (
              <label htmlFor={checkboxId} className={labelClasses}>
                {label}
                {required && <span className="dm-checkbox-required">*</span>}
              </label>
            )}
            {children && <div className="dm-checkbox-children">{children}</div>}
          </div>
        )}

        {/* Helper text */}
        {(helperText || errorText) && (
          <p id={`${checkboxId}-helper`} className={helperTextClasses}>
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

// Preset checkbox components for common D&D use cases
export interface SkillCheckboxProps extends Omit<CheckboxProps, "label"> {
  skill: string;
  ability: string;
  proficient?: boolean;
}

export const SkillCheckbox: React.FC<SkillCheckboxProps> = ({
  skill,
  ability,
  proficient = false,
  ...props
}) => (
  <Checkbox
    label={
      <span className="flex items-center justify-between w-full">
        <span>{skill}</span>
        <span className="text-xs text-secondary">({ability})</span>
        {proficient && (
          <span className="text-xs text-primary-600 font-medium">●</span>
        )}
      </span>
    }
    defaultChecked={proficient}
    {...props}
  />
);

export interface FeatureCheckboxProps extends Omit<CheckboxProps, "label"> {
  featureName: string;
  description?: string;
  level?: number;
}

export const FeatureCheckbox: React.FC<FeatureCheckboxProps> = ({
  featureName,
  description,
  level,
  children,
  ...props
}) => (
  <Checkbox
    label={
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{featureName}</span>
          {level && (
            <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">
              Lv {level}
            </span>
          )}
        </div>
        {description && (
          <div className="text-sm text-secondary mt-1">{description}</div>
        )}
      </div>
    }
    {...props}
  >
    {children}
  </Checkbox>
);

export interface RuleCheckboxProps extends Omit<CheckboxProps, "label"> {
  ruleName: string;
  ruleType?: "optional" | "variant" | "homebrew";
}

export const RuleCheckbox: React.FC<RuleCheckboxProps> = ({
  ruleName,
  ruleType = "optional",
  ...props
}) => {
  const typeConfig = {
    optional: { color: "text-info-600", label: "Opzionale" },
    variant: { color: "text-warning-600", label: "Variante" },
    homebrew: { color: "text-primary-600", label: "Homebrew" },
  };

  const config = typeConfig[ruleType];

  return (
    <Checkbox
      label={
        <div className="flex items-center justify-between w-full">
          <span>{ruleName}</span>
          <span className={`text-xs ${config.color} font-medium`}>
            {config.label}
          </span>
        </div>
      }
      {...props}
    />
  );
};
