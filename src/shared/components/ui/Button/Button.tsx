import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "ghost"
  | "outline"
  // D&D specific variants
  | "magic"
  | "combat"
  | "social"
  | "utility";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      type = "button",
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Base button classes using design system
    const buttonClasses = [
      "button-base", // Base class from globals.css
      `dm-button-${size}`, // Size variant
      `dm-button-${variant}`, // Color variant
      fullWidth ? "dm-button-full" : "",
      loading ? "dm-button-loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="dm-button-spinner"
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
    );

    // Button content with icons and loading state
    const ButtonContent = () => (
      <>
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner />
        ) : leftIcon ? (
          <span className="dm-button-icon-left">{leftIcon}</span>
        ) : null}

        {/* Button text */}
        <span className={loading ? "dm-button-text-loading" : ""}>
          {loading ? "Caricamento..." : children}
        </span>

        {/* Right icon (not shown during loading) */}
        {!loading && rightIcon && (
          <span className="dm-button-icon-right">{rightIcon}</span>
        )}
      </>
    );

    // Render as different element if asChild is true
    if (asChild) {
      return (
        <span className={buttonClasses} {...props}>
          <ButtonContent />
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        <ButtonContent />
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

// Preset Button variants for common D&D actions
export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="primary" {...props} />;

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="secondary" {...props} />;

export const SuccessButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="success" {...props} />;

export const DangerButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="ghost" {...props} />
);

// D&D specific preset buttons
export const CreateButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button
    variant="success"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    }
    {...props}
  />
);

export const EditButton: React.FC<Omit<ButtonProps, "variant" | "leftIcon">> = (
  props
) => (
  <Button
    variant="warning"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    }
    {...props}
  />
);

export const DeleteButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button
    variant="danger"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    }
    {...props}
  />
);

export const LevelUpButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => <Button variant="magic" leftIcon={<span>⬆️</span>} {...props} />;

export const CombatButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button variant="combat" leftIcon={<span>⚔️</span>} {...props} />
);

export const SocialButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button variant="social" leftIcon={<span>💬</span>} {...props} />
);

export const DiceButton: React.FC<Omit<ButtonProps, "variant" | "leftIcon">> = (
  props
) => <Button variant="utility" leftIcon={<span>🎲</span>} {...props} />;

export const AchievementButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button variant="info" leftIcon={<span>🏆</span>} size="sm" {...props} />
);

export const RelationshipButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button variant="social" leftIcon={<span>👥</span>} size="sm" {...props} />
);

export const SaveButton: React.FC<Omit<ButtonProps, "variant" | "leftIcon">> = (
  props
) => (
  <Button
    variant="success"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
        />
      </svg>
    }
    {...props}
  />
);

export const CancelButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button
    variant="ghost"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    }
    {...props}
  />
);

export const RefreshButton: React.FC<
  Omit<ButtonProps, "variant" | "leftIcon">
> = (props) => (
  <Button
    variant="secondary"
    leftIcon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    }
    {...props}
  />
);
