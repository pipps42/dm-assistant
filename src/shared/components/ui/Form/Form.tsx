import React, { createContext, useContext, useRef, useCallback } from "react";
import { Input, TextArea } from "../";

export type FormValidationRule =
  | { required: boolean; message?: string }
  | { pattern: RegExp; message?: string }
  | { min: number; message?: string }
  | { max: number; message?: string }
  | { minLength: number; message?: string }
  | { maxLength: number; message?: string }
  | { custom: (value: any) => string | null; message?: string };

export interface FormFieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  defaultValue?: any;
  rules?: FormValidationRule[];
  disabled?: boolean;
  required?: boolean;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface FormContextValue extends FormState {
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  setTouched: (name: string, touched?: boolean) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: (values?: Record<string, any>) => void;
  getFieldProps: (name: string) => FormFieldProps;
  submit: () => Promise<void>;
}

export interface FormProps {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, FormValidationRule[]>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onValuesChange?: (
    values: Record<string, any>,
    changedFields: string[]
  ) => void;
  className?: string;
  disabled?: boolean;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  rules?: FormValidationRule[];
  children?: React.ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  name: string;
  variant?: "outlined" | "filled" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface FormTextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  name: string;
  variant?: "outlined" | "filled" | "ghost";
  size?: "sm" | "md" | "lg";
  autoResize?: boolean;
  showCharacterCount?: boolean;
  minRows?: number;
  maxRows?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

// Form Context
const FormContext = createContext<FormContextValue | null>(null);

// Custom hook to use form context
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form component");
  }
  return context;
}

// Custom hook for form management
export function useForm(
  initialValues: Record<string, any> = {},
  validationSchema: Record<string, FormValidationRule[]> = {}
) {
  const [state, setState] = React.useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
    isDirty: false,
  });

  const initialValuesRef = useRef(initialValues);

  // Validate single field
  const validateField = useCallback(
    async (name: string): Promise<boolean> => {
      const value = state.values[name];
      const rules = validationSchema[name] || [];

      for (const rule of rules) {
        let isValid = true;
        let message = "";

        if ("required" in rule && rule.required && (!value || value === "")) {
          isValid = false;
          message = rule.message || `${name} è obbligatorio`;
        } else if (
          "pattern" in rule &&
          value &&
          !rule.pattern.test(String(value))
        ) {
          isValid = false;
          message = rule.message || `${name} non è valido`;
        } else if (
          "min" in rule &&
          typeof value === "number" &&
          value < rule.min
        ) {
          isValid = false;
          message = rule.message || `${name} deve essere almeno ${rule.min}`;
        } else if (
          "max" in rule &&
          typeof value === "number" &&
          value > rule.max
        ) {
          isValid = false;
          message = rule.message || `${name} deve essere massimo ${rule.max}`;
        } else if (
          "minLength" in rule &&
          typeof value === "string" &&
          value.length < rule.minLength
        ) {
          isValid = false;
          message =
            rule.message ||
            `${name} deve essere almeno ${rule.minLength} caratteri`;
        } else if (
          "maxLength" in rule &&
          typeof value === "string" &&
          value.length > rule.maxLength
        ) {
          isValid = false;
          message =
            rule.message ||
            `${name} deve essere massimo ${rule.maxLength} caratteri`;
        } else if ("custom" in rule && rule.custom) {
          const customError = rule.custom(value);
          if (customError) {
            isValid = false;
            message = customError;
          }
        }

        if (!isValid) {
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [name]: message },
          }));
          return false;
        }
      }

      // Clear error if validation passed
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
      return true;
    },
    [state.values, validationSchema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(validationSchema);
    const results = await Promise.all(
      fieldNames.map((name) => validateField(name))
    );

    const isValid = results.every(Boolean);
    setState((prev) => ({ ...prev, isValid }));
    return isValid;
  }, [validateField, validationSchema]);

  // Set field value
  const setValue = useCallback((name: string, value: any) => {
    setState((prev) => {
      const newValues = { ...prev.values, [name]: value };
      const isDirty =
        JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);

      return {
        ...prev,
        values: newValues,
        isDirty,
      };
    });
  }, []);

  // Set field error
  const setError = useCallback((name: string, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: "" },
    }));
  }, []);

  // Set field touched
  const setTouched = useCallback((name: string, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  // Reset form
  const resetForm = useCallback((values?: Record<string, any>) => {
    const newValues = values || initialValuesRef.current;
    setState({
      values: newValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
      isDirty: false,
    });
  }, []);

  // Get field props for input components
  const getFieldProps = useCallback(
    (name: string) => {
      return {
        name,
        value: state.values[name] || "",
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setValue(name, e.target.value);
        },
        onBlur: () => {
          setTouched(name, true);
          validateField(name);
        },
        error:
          state.touched[name] && state.errors[name]
            ? state.errors[name]
            : undefined,
      };
    },
    [
      state.values,
      state.touched,
      state.errors,
      setValue,
      setTouched,
      validateField,
    ]
  );

  return {
    ...state,
    setValue,
    setError,
    clearError,
    setTouched,
    validateField,
    validateForm,
    resetForm,
    getFieldProps,
  };
}

// Main Form Component
export function Form({
  children,
  initialValues = {},
  validationSchema = {},
  onSubmit,
  onValuesChange,
  className = "",
  disabled = false,
}: FormProps) {
  const form = useForm(initialValues, validationSchema);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (disabled || isSubmitting) return;

      setIsSubmitting(true);

      try {
        const isValid = await form.validateForm();
        if (isValid) {
          await onSubmit(form.values);
        }
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [disabled, isSubmitting, form, onSubmit]
  );

  // Watch for value changes
  const prevValuesRef = useRef(form.values);
  React.useEffect(() => {
    if (onValuesChange && prevValuesRef.current !== form.values) {
      const changedFields = Object.keys(form.values).filter(
        (key) => prevValuesRef.current[key] !== form.values[key]
      );

      if (changedFields.length > 0) {
        onValuesChange(form.values, changedFields);
      }

      prevValuesRef.current = form.values;
    }
  }, [form.values, onValuesChange]);

  const contextValue: FormContextValue = {
    ...form,
    isSubmitting,
    submit: handleSubmit,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={`dm-form ${className}`}
        onSubmit={handleSubmit}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form Field Component (wrapper for form inputs)
export function FormField({
  name,
  label,
  placeholder,
  helperText,
  rules = [],
  children,
  className = "",
  required = false,
  disabled = false,
}: FormFieldProps) {
  const { getFieldProps, errors, touched } = useFormContext();

  const fieldProps = getFieldProps(name);
  const hasError = touched[name] && errors[name];
  const isRequired =
    required || rules.some((rule) => "required" in rule && rule.required);

  return (
    <div className={`dm-form-field ${className}`}>
      {label && (
        <label className="dm-form-field-label" htmlFor={name}>
          {label}
          {isRequired && <span className="dm-form-field-required">*</span>}
        </label>
      )}

      <div className="dm-form-field-input">
        {children
          ? React.cloneElement(children as React.ReactElement, {
              ...fieldProps,
              id: name,
              placeholder: placeholder || label,
              disabled,
              state: hasError ? "error" : "default",
              errorText: hasError ? errors[name] : undefined,
              helperText: !hasError ? helperText : undefined,
            })
          : null}
      </div>
    </div>
  );
}

// Form Input Component (integrated with form context)
export function FormInput({
  name,
  variant = "outlined",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = true,
  className = "",
  ...props
}: FormInputProps) {
  const { getFieldProps, errors, touched } = useFormContext();
  const fieldProps = getFieldProps(name);
  const hasError = touched[name] && errors[name];

  return (
    <Input
      {...fieldProps}
      {...props}
      variant={variant}
      size={size}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      loading={loading}
      fullWidth={fullWidth}
      className={className}
      state={hasError ? "error" : "default"}
      errorText={hasError ? errors[name] : undefined}
    />
  );
}

// Form TextArea Component (integrated with form context)
export function FormTextArea({
  name,
  variant = "outlined",
  size = "md",
  autoResize = false,
  showCharacterCount = false,
  minRows = 3,
  maxRows = 10,
  resize = "vertical",
  className = "",
  ...props
}: FormTextAreaProps) {
  const { getFieldProps, errors, touched } = useFormContext();
  const fieldProps = getFieldProps(name);
  const hasError = touched[name] && errors[name];

  return (
    <TextArea
      {...fieldProps}
      {...props}
      variant={variant}
      size={size}
      autoResize={autoResize}
      showCharacterCount={showCharacterCount}
      minRows={minRows}
      maxRows={maxRows}
      resize={resize}
      fullWidth={true}
      className={className}
      state={hasError ? "error" : "default"}
      errorText={hasError ? errors[name] : undefined}
    />
  );
}

// Form Actions Component (for submit/cancel buttons)
export interface FormActionsProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "space-between";
  className?: string;
}

export function FormActions({
  children,
  align = "right",
  className = "",
}: FormActionsProps) {
  return (
    <div className={`dm-form-actions dm-form-actions-${align} ${className}`}>
      {children}
    </div>
  );
}

// Form Section Component (for grouping related fields)
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`dm-form-section ${className}`}>
      {(title || description) && (
        <div className="dm-form-section-header">
          {title && <h3 className="dm-form-section-title">{title}</h3>}
          {description && (
            <p className="dm-form-section-description">{description}</p>
          )}
        </div>
      )}
      <div className="dm-form-section-content">{children}</div>
    </div>
  );
}

export default Form;
