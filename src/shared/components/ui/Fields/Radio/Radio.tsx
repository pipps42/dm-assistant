import React, { forwardRef, createContext, useContext } from "react";

export type RadioVariant = "outlined" | "filled" | "ghost";
export type RadioSize = "sm" | "md" | "lg";
export type RadioState = "default" | "error" | "success" | "warning";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: RadioVariant;
  size?: RadioSize;
  state?: RadioState;
  label?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  variant?: RadioVariant;
  size?: RadioSize;
  state?: RadioState;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  direction?: "column" | "row";
}

export interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  variant?: RadioVariant;
  size?: RadioSize;
  state?: RadioState;
  disabled?: boolean;
  required?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      variant = "outlined",
      size = "md",
      state = "default",
      label,
      helperText,
      errorText,
      containerClassName = "",
      className = "",
      disabled,
      required,
      children,
      value,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(RadioGroupContext);

    // Use group context values if available
    const finalVariant = groupContext?.variant || variant;
    const finalSize = groupContext?.size || size;
    const finalState = groupContext?.state || state;
    const finalDisabled = groupContext?.disabled || disabled;
    const finalRequired = groupContext?.required || required;
    const finalName = groupContext?.name || props.name;

    // Determine actual state (error takes precedence)
    const actualState = errorText ? "error" : finalState;

    // Check if this radio is selected in group context
    const isChecked =
      groupContext?.value !== undefined
        ? groupContext.value === value
        : checked;

    // Generate unique ID for label association
    const radioId =
      props.id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    // Handle change event
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (groupContext?.onChange && value !== undefined) {
        groupContext.onChange(String(value), event);
      }
      onChange?.(event);
    };

    // CSS classes using design system tokens
    const containerClasses = [
      "dm-radio-container",
      `dm-radio-container-${finalSize}`,
      finalDisabled ? "dm-radio-container-disabled" : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const radioClasses = [
      "dm-radio",
      `dm-radio-${finalVariant}`,
      `dm-radio-${finalSize}`,
      `dm-radio-${actualState}`,
      finalDisabled ? "dm-radio-disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      "dm-radio-label",
      finalDisabled ? "dm-radio-label-disabled" : "",
      actualState === "error" ? "dm-radio-label-error" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const helperTextClasses = [
      "dm-radio-helper",
      `dm-radio-helper-${actualState}`,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        <div className="dm-radio-input-container">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={finalName}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            className={radioClasses}
            disabled={finalDisabled}
            required={finalRequired}
            aria-describedby={
              helperText || errorText ? `${radioId}-helper` : undefined
            }
            aria-invalid={actualState === "error"}
            {...props}
          />

          {/* Custom radio visual */}
          <div className="dm-radio-visual">
            <div className="dm-radio-dot"></div>
          </div>
        </div>

        {/* Label and content */}
        {(label || children) && (
          <div className="dm-radio-content">
            {label && (
              <label htmlFor={radioId} className={labelClasses}>
                {label}
                {finalRequired && <span className="dm-radio-required">*</span>}
              </label>
            )}
            {children && <div className="dm-radio-children">{children}</div>}
          </div>
        )}

        {/* Helper text */}
        {(helperText || errorText) && (
          <p id={`${radioId}-helper`} className={helperTextClasses}>
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = "Radio";

// Radio Group Component
export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  defaultValue,
  onChange,
  variant = "outlined",
  size = "md",
  state = "default",
  disabled = false,
  required = false,
  children,
  className = "",
  label,
  helperText,
  errorText,
  direction = "column",
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (
    newValue: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue, event);
  };

  const contextValue: RadioGroupContextValue = {
    name,
    value: currentValue,
    onChange: handleChange,
    variant,
    size,
    state: errorText ? "error" : state,
    disabled,
    required,
  };

  const groupClasses = [
    "dm-radio-group",
    `dm-radio-group-${direction}`,
    `dm-radio-group-${size}`,
    disabled ? "dm-radio-group-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="dm-radio-group-container">
      {/* Group Label */}
      {label && (
        <div className="dm-radio-group-label" id={`${groupId}-label`}>
          {label}
          {required && <span className="dm-radio-group-required">*</span>}
        </div>
      )}

      {/* Radio Options */}
      <RadioGroupContext.Provider value={contextValue}>
        <div
          className={groupClasses}
          role="radiogroup"
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-describedby={
            helperText || errorText ? `${groupId}-helper` : undefined
          }
        >
          {children}
        </div>
      </RadioGroupContext.Provider>

      {/* Group Helper Text */}
      {(helperText || errorText) && (
        <p
          id={`${groupId}-helper`}
          className={`dm-radio-group-helper ${
            errorText ? "dm-radio-group-helper-error" : ""
          }`}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
};

export default Radio;

// Preset radio components for common D&D use cases
export interface AbilityScoreMethodRadioProps
  extends Omit<RadioProps, "value" | "label"> {
  method: "standard" | "point-buy" | "rolling" | "manual";
}

export const AbilityScoreMethodRadio: React.FC<
  AbilityScoreMethodRadioProps
> = ({ method, ...props }) => {
  const methodConfig = {
    standard: {
      label: "Standard Array",
      description: "Usa i valori predefiniti: 15, 14, 13, 12, 10, 8",
    },
    "point-buy": {
      label: "Point Buy",
      description: "Distribuisci 27 punti tra le caratteristiche",
    },
    rolling: {
      label: "Tiri di Dado",
      description: "Tira 4d6, scarta il più basso, per 6 volte",
    },
    manual: {
      label: "Inserimento Manuale",
      description: "Inserisci manualmente i valori delle caratteristiche",
    },
  };

  const config = methodConfig[method];

  return (
    <Radio
      value={method}
      label={
        <div>
          <div className="font-medium">{config.label}</div>
          <div className="text-sm text-secondary mt-1">
            {config.description}
          </div>
        </div>
      }
      {...props}
    />
  );
};

export interface DifficultyRadioProps
  extends Omit<RadioProps, "value" | "label"> {
  difficulty: "easy" | "medium" | "hard" | "deadly";
}

export const DifficultyRadio: React.FC<DifficultyRadioProps> = ({
  difficulty,
  ...props
}) => {
  const difficultyConfig = {
    easy: {
      label: "Facile",
      color: "text-success-600",
      description: "Gli incontri sono semplici e raramente pericolosi",
    },
    medium: {
      label: "Normale",
      color: "text-info-600",
      description: "Bilanciamento standard, alcuni incontri impegnativi",
    },
    hard: {
      label: "Difficile",
      color: "text-warning-600",
      description: "Incontri impegnativi, risorse limitate",
    },
    deadly: {
      label: "Mortale",
      color: "text-error-600",
      description: "Massima difficoltà, ogni incontro è pericoloso",
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <Radio
      value={difficulty}
      label={
        <div>
          <div className={`font-medium ${config.color}`}>{config.label}</div>
          <div className="text-sm text-secondary mt-1">
            {config.description}
          </div>
        </div>
      }
      {...props}
    />
  );
};

export interface SpellcastingRadioProps
  extends Omit<RadioProps, "value" | "label"> {
  type: "none" | "full" | "half" | "third" | "pact";
}

export const SpellcastingRadio: React.FC<SpellcastingRadioProps> = ({
  type,
  ...props
}) => {
  const typeConfig = {
    none: {
      label: "Nessuna Magia",
      description: "Nessuna capacità di lancio incantesimi",
    },
    full: {
      label: "Incantatore Completo",
      description: "Progressione completa (Mago, Stregone, ecc.)",
    },
    half: {
      label: "Mezzo Incantatore",
      description: "Progressione dimezzata (Paladino, Ranger)",
    },
    third: {
      label: "Un Terzo Incantatore",
      description: "Progressione ridotta (Guerriero Mistico, ecc.)",
    },
    pact: {
      label: "Pact Magic",
      description: "Magia del patto (Warlock)",
    },
  };

  const config = typeConfig[type];

  return (
    <Radio
      value={type}
      label={
        <div>
          <div className="font-medium">{config.label}</div>
          <div className="text-sm text-secondary mt-1">
            {config.description}
          </div>
        </div>
      }
      {...props}
    />
  );
};
