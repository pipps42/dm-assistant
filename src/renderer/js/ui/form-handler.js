/**
 * Form Handler - Gestione form generica e riutilizzabile
 * Supporta validazione, binding dati, gestione submit
 */
import EventBus from "../core/event-bus.js";
import { ModelFactory } from "../data/models.js";

class FormHandler {
  constructor(form, options = {}) {
    this.form = typeof form === "string" ? document.getElementById(form) : form;
    this.options = {
      validateOnChange: true,
      validateOnSubmit: true,
      autoFocus: true,
      showValidationMessages: true,
      submitButton: 'button[type="submit"]',
      cancelButton: 'button[data-action="cancel"]',
      resetOnSubmit: false,
      entityType: null,
      mode: "create", // create, edit
      ...options,
    };

    this.eventBus = EventBus;
    this.validators = new Map();
    this.originalData = {};
    this.isSubmitting = false;

    if (this.form) {
      this.init();
    }
  }

  /**
   * Initialize form handler
   */
  init() {
    this.setupEventListeners();
    this.setupValidation();

    if (this.options.autoFocus) {
      this.focusFirstInput();
    }

    this.eventBus.emit("form:initialized", {
      form: this.form,
      options: this.options,
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Submit handler
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Cancel handler
    const cancelBtn = this.form.querySelector(this.options.cancelButton);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.handleCancel());
    }

    // Real-time validation
    if (this.options.validateOnChange) {
      this.form.addEventListener("input", (e) => this.handleInput(e));
      this.form.addEventListener("change", (e) => this.handleChange(e));
    }

    // Enter key handling
    this.form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        this.handleSubmit(e);
      }
    });
  }

  /**
   * Setup validation rules
   */
  setupValidation() {
    const inputs = this.form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const rules = this.getValidationRules(input);
      if (rules.length > 0) {
        this.validators.set(input.name, rules);
      }
    });
  }

  /**
   * Get validation rules for input
   */
  getValidationRules(input) {
    const rules = [];

    // Required
    if (input.hasAttribute("required")) {
      rules.push({
        name: "required",
        message: `${this.getFieldLabel(input)} è richiesto`,
        validate: (value) => value && value.trim().length > 0,
      });
    }

    // Email
    if (input.type === "email") {
      rules.push({
        name: "email",
        message: "Inserisci un email valido",
        validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      });
    }

    // Number
    if (input.type === "number") {
      const min = input.getAttribute("min");
      const max = input.getAttribute("max");

      if (min !== null) {
        rules.push({
          name: "min",
          message: `Valore minimo: ${min}`,
          validate: (value) => !value || Number(value) >= Number(min),
        });
      }

      if (max !== null) {
        rules.push({
          name: "max",
          message: `Valore massimo: ${max}`,
          validate: (value) => !value || Number(value) <= Number(max),
        });
      }
    }

    // Min/Max length
    const minLength = input.getAttribute("minlength");
    const maxLength = input.getAttribute("maxlength");

    if (minLength) {
      rules.push({
        name: "minlength",
        message: `Minimo ${minLength} caratteri`,
        validate: (value) => !value || value.length >= Number(minLength),
      });
    }

    if (maxLength) {
      rules.push({
        name: "maxlength",
        message: `Massimo ${maxLength} caratteri`,
        validate: (value) => !value || value.length <= Number(maxLength),
      });
    }

    // Pattern
    const pattern = input.getAttribute("pattern");
    if (pattern) {
      rules.push({
        name: "pattern",
        message: "Formato non valido",
        validate: (value) => !value || new RegExp(pattern).test(value),
      });
    }

    return rules;
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      this.setSubmitButtonState(true);

      // Validate form
      if (this.options.validateOnSubmit && !this.validate()) {
        return;
      }

      // Get form data
      const formData = this.getFormData();

      // Emit submit event
      const submitResult = await this.eventBus.emit("form:submit", {
        formData,
        originalData: this.originalData,
        form: this.form,
        options: this.options,
        handler: this,
      });

      // If no listeners handled the submit, try default handling
      if (!submitResult) {
        await this.defaultSubmitHandler(formData);
      }

      // Reset form if requested
      if (this.options.resetOnSubmit) {
        this.reset();
      }

      this.eventBus.emit("form:submitted", {
        formData,
        form: this.form,
        options: this.options,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      this.showError(error.message || "Errore durante il salvataggio");

      this.eventBus.emit("form:error", {
        error,
        form: this.form,
        options: this.options,
      });
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState(false);
    }
  }

  /**
   * Default submit handler
   */
  async defaultSubmitHandler(formData) {
    if (!this.options.entityType) {
      throw new Error("No entity type specified for form submission");
    }

    // Get the appropriate manager
    const managerName = `${this.options.entityType.slice(0, -1)}Manager`;
    const manager = window[managerName];

    if (!manager) {
      throw new Error(`Manager ${managerName} not found`);
    }

    // Create or update entity
    if (this.options.mode === "edit" && this.originalData.id) {
      await manager.updateEntity(this.originalData.id, formData);
    } else {
      await manager.createEntity(formData);
    }
  }

  /**
   * Handle cancel action
   */
  handleCancel() {
    this.eventBus.emit("form:cancelled", {
      form: this.form,
      options: this.options,
    });

    // Default cancel behavior
    if (window.app && window.app.closeModal) {
      window.app.closeModal();
    }
  }

  /**
   * Handle input changes
   */
  handleInput(event) {
    const input = event.target;
    if (input.name && this.validators.has(input.name)) {
      this.validateField(input);
    }
  }

  /**
   * Handle field changes
   */
  handleChange(event) {
    const input = event.target;

    this.eventBus.emit("form:fieldChanged", {
      field: input.name,
      value: input.value,
      form: this.form,
    });
  }

  /**
   * Validate entire form
   */
  validate() {
    let isValid = true;
    const errors = {};

    // Validate each field
    const inputs = this.form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (input.name && this.validators.has(input.name)) {
        const fieldErrors = this.validateField(input);
        if (fieldErrors.length > 0) {
          isValid = false;
          errors[input.name] = fieldErrors;
        }
      }
    });

    // Entity-specific validation if available
    if (this.options.entityType && isValid) {
      const formData = this.getFormData();
      const modelErrors = ModelFactory.validate(
        this.options.entityType.slice(0, -1), // Remove 's' from plural
        formData
      );

      if (modelErrors.length > 0) {
        isValid = false;
        this.showError("Errori di validazione:\n" + modelErrors.join("\n"));
      }
    }

    this.eventBus.emit("form:validated", {
      isValid,
      errors,
      form: this.form,
    });

    return isValid;
  }

  /**
   * Validate single field
   */
  validateField(input) {
    const rules = this.validators.get(input.name) || [];
    const errors = [];
    const value = input.value;

    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }

    // Show/hide validation message
    if (this.options.showValidationMessages) {
      this.showFieldValidation(input, errors);
    }

    return errors;
  }

  /**
   * Show field validation message
   */
  showFieldValidation(input, errors) {
    // Remove existing validation message
    const existingMessage = input.parentNode.querySelector(
      ".validation-message"
    );
    if (existingMessage) {
      existingMessage.remove();
    }

    // Add validation class
    input.classList.toggle("invalid", errors.length > 0);

    // Show new message if there are errors
    if (errors.length > 0) {
      const message = document.createElement("div");
      message.className = "validation-message";
      message.textContent = errors[0]; // Show first error
      input.parentNode.appendChild(message);
    }
  }

  /**
   * Get form data as object
   */
  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      // Handle checkboxes and multiple values
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    // Process special fields
    this.processFormData(data);

    return data;
  }

  /**
   * Process form data for special fields
   */
  processFormData(data) {
    // Convert string numbers to numbers
    Object.keys(data).forEach((key) => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === "number") {
          data[key] = data[key] ? Number(data[key]) : null;
        } else if (input.type === "checkbox") {
          data[key] = input.checked;
        }
      }
    });

    // Handle comma-separated lists
    const listFields = ["dangers", "resources", "skills"];
    listFields.forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        data[field] = data[field]
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      }
    });

    // Handle line-separated lists
    const lineFields = ["interactions", "adventures"];
    lineFields.forEach((field) => {
      if (data[field] && typeof data[field] === "string") {
        data[field] = data[field]
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item);
      }
    });
  }

  /**
   * Populate form with data
   */
  populate(data) {
    this.originalData = { ...data };

    Object.keys(data).forEach((key) => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === "checkbox") {
          input.checked = Boolean(data[key]);
        } else if (input.type === "radio") {
          if (input.value === String(data[key])) {
            input.checked = true;
          }
        } else {
          input.value = data[key] || "";
        }
      }
    });

    this.eventBus.emit("form:populated", {
      data,
      form: this.form,
    });
  }

  /**
   * Reset form
   */
  reset() {
    this.form.reset();
    this.originalData = {};

    // Clear validation messages
    this.form
      .querySelectorAll(".validation-message")
      .forEach((msg) => msg.remove());
    this.form
      .querySelectorAll(".invalid")
      .forEach((input) => input.classList.remove("invalid"));

    this.eventBus.emit("form:reset", {
      form: this.form,
    });
  }

  /**
   * Focus first input
   */
  focusFirstInput() {
    const firstInput = this.form.querySelector(
      'input:not([type="hidden"]), select, textarea'
    );
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  /**
   * Set submit button state
   */
  setSubmitButtonState(loading) {
    const submitBtn = this.form.querySelector(this.options.submitButton);
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading
        ? "Salvando..."
        : this.options.mode === "edit"
        ? "Aggiorna"
        : "Salva";
    }
  }

  /**
   * Get field label
   */
  getFieldLabel(input) {
    const label = this.form.querySelector(`label[for="${input.id}"]`);
    return label ? label.textContent.replace("*", "").trim() : input.name;
  }

  /**
   * Show error message
   */
  showError(message) {
    if (window.app && window.app.showError) {
      window.app.showError(message);
    } else {
      alert(message);
    }
  }

  /**
   * Destroy form handler
   */
  destroy() {
    // Remove event listeners would go here
    // For now, just clear references
    this.form = null;
    this.validators.clear();
    this.originalData = {};
  }
}

/**
 * Factory function for creating form handlers
 */
export function createFormHandler(form, options) {
  return new FormHandler(form, options);
}

export default FormHandler;
