import React, { useId } from "react";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
  label?: string;
  description?: string;
  name?: string;
  value?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

// ================================================================
// MAIN SWITCH COMPONENT
// ================================================================

const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  size = "md",
  disabled = false,
  label,
  description,
  name,
  value,
  required = false,
  className = "",
  id: providedId,
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const descriptionId = `${id}-description`;

  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  // Use controlled or uncontrolled state
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;

    if (checked === undefined) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  const switchClasses = [
    "dm-switch",
    `dm-switch-${size}`,
    isChecked ? "dm-switch-checked" : "",
    disabled ? "dm-switch-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="dm-switch-wrapper">
      <div className="dm-switch-container">
        {/* Hidden input for form submission and accessibility */}
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="dm-switch-input"
          aria-describedby={description ? descriptionId : undefined}
        />

        {/* Visual switch element */}
        <label htmlFor={id} className={switchClasses}>
          <span className="dm-switch-track">
            <span className="dm-switch-thumb" />
          </span>
        </label>
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className="dm-switch-content">
          {label && (
            <label htmlFor={id} className="dm-switch-label">
              {label}
              {required && <span className="dm-switch-required">*</span>}
            </label>
          )}
          {description && (
            <div id={descriptionId} className="dm-switch-description">
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Switch;
