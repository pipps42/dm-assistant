import React, { forwardRef, useEffect, useRef, useState } from "react";

export type TextAreaVariant = "outlined" | "filled" | "ghost";
export type TextAreaSize = "sm" | "md" | "lg";
export type TextAreaState = "default" | "error" | "success" | "warning";
export type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  state?: TextAreaState;
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  resize?: TextAreaResize;
  autoResize?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  containerClassName?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      variant = "outlined",
      size = "md",
      state = "default",
      label,
      helperText,
      errorText,
      fullWidth = false,
      resize = "vertical",
      autoResize = false,
      showCharacterCount = false,
      maxLength,
      minRows = 3,
      maxRows = 10,
      className = "",
      containerClassName = "",
      disabled,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mergedRef = ref || textareaRef;

    // Determine actual state (error takes precedence)
    const actualState = errorText ? "error" : state;

    // Character count
    const currentLength =
      typeof value === "string"
        ? value.length
        : internalValue.toString().length;
    const showCount = showCharacterCount && (maxLength || currentLength > 0);

    // Auto-resize functionality
    const adjustHeight = () => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const style = window.getComputedStyle(textarea);
      const borderHeight =
        parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
      const paddingHeight =
        parseInt(style.paddingTop) + parseInt(style.paddingBottom);

      // Reset height to get accurate scrollHeight
      textarea.style.height = "auto";

      // Calculate new height
      const lineHeight = parseInt(style.lineHeight) || 20;
      const minHeight = lineHeight * minRows + paddingHeight + borderHeight;
      const maxHeight = lineHeight * maxRows + paddingHeight + borderHeight;
      const scrollHeight = textarea.scrollHeight;

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    };

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Check maxLength
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      setInternalValue(newValue);

      if (onChange) {
        onChange(e);
      }

      // Auto-resize after value change
      if (autoResize) {
        setTimeout(adjustHeight, 0);
      }
    };

    // Auto-resize on mount and value changes
    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [autoResize, value, internalValue]);

    // CSS classes using design system
    const textareaClasses = [
      "dm-input", // Base class from globals.css
      "transition-fast",
      `dm-textarea-${size}`,
      `dm-textarea-${variant}`,
      actualState !== "default" ? `dm-textarea-${actualState}` : "",
      `dm-textarea-resize-${resize}`,
      autoResize ? "dm-textarea-auto-resize" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Helper text classes using semantic tokens
    const helperTextClasses = {
      default: "text-secondary",
      error: "state-error",
      success: "state-success",
      warning: "state-warning",
    };

    // Label classes using semantic tokens
    const labelClasses = [
      "dm-textarea-label",
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

        {/* TextArea */}
        <textarea
          ref={mergedRef}
          className={textareaClasses}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          rows={autoResize ? undefined : minRows}
          aria-describedby={
            helperText || errorText || showCount
              ? `${props.id}-helper`
              : undefined
          }
          aria-invalid={actualState === "error"}
          {...props}
        />

        {/* Footer with helper text and character count */}
        {(helperText || errorText || showCount) && (
          <div className="dm-textarea-footer">
            {/* Helper Text */}
            {(helperText || errorText) && (
              <p
                id={`${props.id}-helper`}
                className={`dm-textarea-helper ${helperTextClasses[actualState]}`}
              >
                {errorText || helperText}
              </p>
            )}

            {/* Character Count */}
            {showCount && (
              <p
                className={`dm-textarea-count ${
                  maxLength && currentLength > maxLength * 0.9
                    ? currentLength >= maxLength
                      ? "state-error"
                      : "state-warning"
                    : "text-tertiary"
                }`}
              >
                {currentLength}
                {maxLength && `/${maxLength}`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;

// Preset TextArea variants for common use cases
export const CharacterBackgroundTextArea: React.FC<
  Omit<TextAreaProps, "label" | "placeholder">
> = (props) => (
  <TextArea
    label="Background del Personaggio"
    placeholder="Descrivi il background, la storia e le motivazioni del personaggio..."
    minRows={4}
    maxRows={8}
    autoResize
    showCharacterCount
    maxLength={500}
    {...props}
  />
);

export const DMNotesTextArea: React.FC<
  Omit<TextAreaProps, "label" | "placeholder">
> = (props) => (
  <TextArea
    label="Note Private del DM"
    placeholder="Note riservate al DM su questo elemento..."
    variant="filled"
    minRows={3}
    maxRows={6}
    autoResize
    {...props}
  />
);

export const QuestDescriptionTextArea: React.FC<
  Omit<TextAreaProps, "label" | "placeholder">
> = (props) => (
  <TextArea
    label="Descrizione Quest"
    placeholder="Descrivi obiettivi, ricompense e dettagli della quest..."
    minRows={4}
    maxRows={10}
    autoResize
    showCharacterCount
    maxLength={1000}
    {...props}
  />
);

export const EnvironmentDescriptionTextArea: React.FC<
  Omit<TextAreaProps, "label" | "placeholder">
> = (props) => (
  <TextArea
    label="Descrizione Ambiente"
    placeholder="Descrivi l'aspetto, l'atmosfera e i dettagli dell'ambiente..."
    minRows={3}
    maxRows={8}
    autoResize
    showCharacterCount
    maxLength={800}
    {...props}
  />
);

export const NPCPersonalityTextArea: React.FC<
  Omit<TextAreaProps, "label" | "placeholder">
> = (props) => (
  <TextArea
    label="Personalità e Motivazioni"
    placeholder="Descrivi la personalità, i tratti distintivi e le motivazioni dell'NPC..."
    minRows={3}
    maxRows={6}
    autoResize
    showCharacterCount
    maxLength={600}
    {...props}
  />
);
