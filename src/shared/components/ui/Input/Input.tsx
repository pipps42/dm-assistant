import React, { forwardRef } from "react";

export type InputVariant = "outlined" | "filled" | "ghost";
export type InputSize = "sm" | "md" | "lg";
export type InputState = "default" | "error" | "success" | "warning";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "outlined",
      size = "md",
      state = "default",
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      className = "",
      containerClassName = "",
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Determine actual state (error takes precedence)
    const actualState = errorText ? "error" : state;

    // CSS classes using design system tokens
    const inputStyles = {
      // Base styles using CSS custom properties
      base: [
        "dm-input", // Base class from globals.css
        "transition-fast", // Transition utility
      ].join(" "),

      // Size variations using component tokens
      size: {
        sm: "dm-input-sm",
        md: "dm-input-md",
        lg: "dm-input-lg",
      },

      // Variant + state combinations
      variant: {
        outlined: {
          default: "dm-input-outlined",
          error: "dm-input-outlined dm-input-error",
          success: "dm-input-outlined dm-input-success",
          warning: "dm-input-outlined dm-input-warning",
        },
        filled: {
          default: "dm-input-filled",
          error: "dm-input-filled dm-input-error",
          success: "dm-input-filled dm-input-success",
          warning: "dm-input-filled dm-input-warning",
        },
        ghost: {
          default: "dm-input-ghost",
          error: "dm-input-ghost dm-input-error",
          success: "dm-input-ghost dm-input-success",
          warning: "dm-input-ghost dm-input-warning",
        },
      },

      // Icon padding using component tokens
      iconPadding: {
        sm: {
          left: leftIcon ? "dm-input-icon-left-sm" : "",
          right: rightIcon || loading ? "dm-input-icon-right-sm" : "",
        },
        md: {
          left: leftIcon ? "dm-input-icon-left-md" : "",
          right: rightIcon || loading ? "dm-input-icon-right-md" : "",
        },
        lg: {
          left: leftIcon ? "dm-input-icon-left-lg" : "",
          right: rightIcon || loading ? "dm-input-icon-right-lg" : "",
        },
      },
    };

    // Combine all input classes
    const inputClasses = [
      inputStyles.base,
      inputStyles.size[size],
      inputStyles.iconPadding[size].left,
      inputStyles.iconPadding[size].right,
      inputStyles.variant[variant][actualState],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Icon classes using design system
    const iconClasses = {
      container: "dm-input-icon-container",
      size: {
        sm: "dm-icon-sm",
        md: "dm-icon-md",
        lg: "dm-icon-lg",
      },
      position: {
        sm: {
          left: "dm-input-icon-pos-left-sm",
          right: "dm-input-icon-pos-right-sm",
        },
        md: {
          left: "dm-input-icon-pos-left-md",
          right: "dm-input-icon-pos-right-md",
        },
        lg: {
          left: "dm-input-icon-pos-left-lg",
          right: "dm-input-icon-pos-right-lg",
        },
      },
    };

    // Helper text classes using semantic tokens
    const helperTextClasses = {
      default: "text-secondary",
      error: "state-error",
      success: "state-success",
      warning: "state-warning",
    };

    // Label classes using semantic tokens
    const labelClasses = [
      "dm-input-label",
      actualState === "error" ? "state-error" : "text-primary",
    ].join(" ");

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="state-error ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={`${iconClasses.container} ${iconClasses.position[size].left}`}
            >
              <div className={iconClasses.size[size]}>{leftIcon}</div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled || loading}
            required={required}
            aria-describedby={
              helperText || errorText ? `${props.id}-helper` : undefined
            }
            aria-invalid={actualState === "error"}
            {...props}
          />

          {/* Right Icon or Loading */}
          {(rightIcon || loading) && (
            <div
              className={`${iconClasses.container} ${iconClasses.position[size].right}`}
            >
              <div className={iconClasses.size[size]}>
                {loading ? (
                  <svg
                    className="dm-loading-spinner"
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
                ) : (
                  rightIcon
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper Text */}
        {(helperText || errorText) && (
          <p
            id={`${props.id}-helper`}
            className={`dm-input-helper ${helperTextClasses[actualState]}`}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
