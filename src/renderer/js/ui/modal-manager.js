/**
 * Modal Manager - Gestione centralizzata delle modali
 * Supporta stack di modali, template injection, gestione focus
 */
import EventBus from "../core/event-bus.js";

class ModalManager {
  constructor() {
    this.eventBus = EventBus;
    this.modalStack = [];
    this.isInitialized = false;
    this.resolvers = new Map(); // For promise-based modals

    this.setupEventListeners();
  }

  /**
   * Initialize modal manager
   */
  init() {
    if (this.isInitialized) return;

    this.modal = document.getElementById("modal");
    this.modalTitle = document.getElementById("modal-title");
    this.modalBody = document.getElementById("modal-body");
    this.closeButton = document.getElementById("modal-close");

    if (!this.modal) {
      console.error("Modal elements not found in DOM");
      return;
    }

    this.setupDOMEventListeners();
    this.isInitialized = true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventBus.on("modal:open", (data) => this.open(data));
    this.eventBus.on("modal:close", () => this.close());
    this.eventBus.on("modal:confirm", (data) => this.showConfirm(data));
    this.eventBus.on("modal:input", (data) => this.showInput(data));
  }

  /**
   * Setup DOM event listeners
   */
  setupDOMEventListeners() {
    // Close button
    this.closeButton.addEventListener("click", () => this.close());

    // Click outside modal
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  /**
   * Open modal with configuration
   * @param {object} config - Modal configuration
   */
  open(config) {
    if (!this.isInitialized) this.init();

    const {
      type = "default",
      entityType,
      mode = "create",
      entity = null,
      title = "Modal",
      content = "",
      size = "medium",
      closable = true,
      ...rest
    } = config;

    let modalContent = content;
    let modalTitle = title;

    // Generate content if not provided
    if (!modalContent && entityType) {
      const manager = window.app?.managers?.[entityType];

      if (manager?.templates) {
        try {
          if (type === "form") {
            modalContent = manager.templates.generateForm(entity, mode);
            if (!modalTitle || modalTitle === "Modal") {
              modalTitle =
                mode === "edit"
                  ? `Modifica ${manager.getEntityDisplayName()}`
                  : `Aggiungi ${manager.getEntityDisplayName()}`;
            }
          } else if (type === "detail") {
            modalContent = manager.templates.generateDetail(entity);
            if (!modalTitle || modalTitle === "Modal") {
              modalTitle = entity?.name || manager.getEntityDisplayName();
            }
          } else if (type === "confirm") {
            modalContent = this.generateConfirmContent(config);
          } else if (type === "input") {
            modalContent = this.generateInputContent(config);
          }
        } catch (error) {
          console.error(
            `Error generating ${type} template for ${entityType}:`,
            error
          );
          modalContent = `<div class="error-state">
          <h3>Errore Template</h3>
          <p>Impossibile generare il template ${type} per ${entityType}</p>
          <pre>${error.message}</pre>
        </div>`;
        }
      } else {
        console.warn(`Manager or templates not found for ${entityType}`, {
          manager: !!manager,
          templates: !!manager?.templates,
          availableManagers: window.app
            ? Object.keys(window.app.managers)
            : "app not ready",
        });
        modalContent = `<div class="error-state">
        <h3>${type === "form" ? "Form" : "Detail"} template not found</h3>
        <p>Manager per "${entityType}" non trovato o non inizializzato</p>
      </div>`;
      }
    }

    const modalConfig = {
      type,
      entityType,
      mode,
      entity,
      title: modalTitle,
      content: modalContent,
      size,
      closable,
      ...rest,
    };

    this.modalStack.push(modalConfig);

    // Use correct property names from init()
    this.modalTitle.textContent = modalTitle;
    this.modalBody.innerHTML = modalContent;

    // Apply size class
    this.modal.className = `modal modal-${size}`;

    this.showModal();

    // Emit rendered event for component setup
    this.eventBus.emit("modal:rendered", modalConfig);

    // Setup handlers based on modal type
    if (type === "detail") {
      this.setupDetailHandlers(modalConfig);
    } else if (type === "form") {
      this.setupFormHandlers(modalConfig);
    } else if (type === "confirm" || type === "input") {
      this.setupPromiseHandlers(modalConfig);
    }
  }

  /**
   * Close current modal
   */
  close() {
    if (this.modalStack.length === 0) return;

    const currentModal = this.modalStack.pop();

    if (this.modalStack.length > 0) {
      // Show previous modal in stack
      const previousModal = this.modalStack[this.modalStack.length - 1];

      // Re-render the previous modal
      this.modalTitle.textContent = previousModal.title;
      this.modalBody.innerHTML = previousModal.content;

      // Apply size class
      this.modal.className = `modal modal-${previousModal.size}`;

      // Setup handlers for the previous modal
      if (previousModal.type === "detail") {
        this.setupDetailHandlers(previousModal);
      } else if (previousModal.type === "form") {
        this.setupFormHandlers(previousModal);
      } else if (
        previousModal.type === "confirm" ||
        previousModal.type === "input"
      ) {
        this.setupPromiseHandlers(previousModal);
      }

      // Emit rendered event
      this.eventBus.emit("modal:rendered", previousModal);
    } else {
      // Close modal completely
      this.hideModal();
    }

    // Resolve any pending promises
    if (currentModal.resolver) {
      currentModal.resolver(null);
    }

    this.eventBus.emit("modal:closed", currentModal);
  }

  /**
   * Show confirmation modal
   */
  showConfirm(config) {
    return new Promise((resolve) => {
      const confirmConfig = {
        type: "confirm",
        title: config.title || "Conferma",
        content: this.generateConfirmContent(config),
        resolver: resolve,
        closable: true,
        ...config,
      };

      this.open(confirmConfig);
    });
  }

  /**
   * Show input modal
   */
  showInput(config) {
    return new Promise((resolve) => {
      const inputConfig = {
        type: "input",
        title: config.title || "Inserisci valore",
        content: this.generateInputContent(config),
        resolver: resolve,
        closable: true,
        ...config,
      };

      this.open(inputConfig);
    });
  }

  /**
   * Setup promise-based modal handlers
   */
  setupPromiseHandlers(config) {
    this.modalBody.addEventListener("click", (e) => {
      const button = e.target.closest("button[data-modal-action]");
      if (!button) return;

      const action = button.dataset.modalAction;
      let result = null;

      if (action === "confirm") {
        if (config.type === "input") {
          const input = this.modalBody.querySelector("#modal-input");
          result = input ? input.value : null;
        } else {
          result = true;
        }
      }

      if (config.resolver) {
        config.resolver(result);
      }

      this.close();
    });

    // Auto-focus input in input modals
    if (config.type === "input") {
      setTimeout(() => {
        const input = this.modalBody.querySelector("#modal-input");
        if (input) input.focus();
      }, 100);
    }
  }

  /**
   * Show modal
   */
  showModal() {
    this.modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Focus management
    this.trapFocus();
  }

  /**
   * Hide modal
   */
  hideModal() {
    this.modal.style.display = "none";
    document.body.style.overflow = "auto";

    // Restore focus
    this.restoreFocus();
  }

  /**
   * Check if modal is open
   */
  isOpen() {
    return this.modal && this.modal.style.display === "block";
  }

  /**
   * Get template module for entity type
   */
  getTemplateModule(entityType) {
    // This would dynamically import template modules
    // For now, return null - will be implemented with template system
    return null;
  }

  /**
   * Focus management
   */
  trapFocus() {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  restoreFocus() {
    // Restore focus to previously focused element
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
      this.previouslyFocused = null;
    }
  }

  /**
   * Generate confirm content
   */
  generateConfirmContent(config) {
    return `
    <p style="margin-bottom: 20px; line-height: 1.5;">${config.message}</p>
    <div class="flex gap-1" style="justify-content: flex-end;">
      <button type="button" class="btn btn-secondary" data-modal-action="cancel">
        ${config.cancelText || "Annulla"}
      </button>
      <button type="button" class="btn btn-danger" data-modal-action="confirm">
        ${config.confirmText || "Conferma"}
      </button>
    </div>
  `;
  }

  /**
   * Generate input content
   */
  generateInputContent(config) {
    const inputType = config.inputType || "textarea";
    let inputHtml = "";

    if (inputType === "textarea") {
      inputHtml = `
      <textarea class="form-textarea" id="modal-input" 
               placeholder="${config.placeholder || ""}" 
               style="min-height: 80px;">${config.defaultValue || ""}</textarea>
    `;
    } else {
      inputHtml = `
      <input type="${inputType}" class="form-input" id="modal-input" 
             placeholder="${config.placeholder || ""}" 
             value="${config.defaultValue || ""}">
    `;
    }

    return `
    <div class="form-group">
      <label class="form-label">${config.label || config.title}</label>
      ${inputHtml}
    </div>
    <div class="flex gap-1 mt-2" style="justify-content: flex-end;">
      <button type="button" class="btn btn-secondary" data-modal-action="cancel">Annulla</button>
      <button type="button" class="btn btn-primary" data-modal-action="confirm">Conferma</button>
    </div>
  `;
  }

  /**
   * Setup form handlers
   */
  setupFormHandlers(config) {
    const form = this.modalBody.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Extract form data
      const formData = new FormData(form);
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
      Object.keys(data).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === "number") {
            data[key] = data[key] ? Number(data[key]) : null;
          } else if (input.type === "checkbox") {
            data[key] = input.checked;
          }
        }
      });

      this.eventBus.emit("form:submit", {
        formData: data,
        form,
        options: config,
        config,
        modalManager: this,
      });
    });
  }

  /**
   * Setup detail handlers
   */
  setupDetailHandlers(config) {
    // Event delegation for buttons in detail view
    this.modalBody.addEventListener("click", (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const entityId = config.entity?.id;

      // Get additional data attributes
      const additionalData = {};
      for (const attr of button.attributes) {
        if (attr.name.startsWith("data-") && attr.name !== "data-action") {
          const key = attr.name
            .replace("data-", "")
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          additionalData[key] = attr.value;
        }
      }

      this.eventBus.emit("detail:action", {
        action,
        entityId,
        entityType: config.entityType,
        config,
        ...additionalData,
      });
    });
  }

  /**
   * Setup promise-based modal handlers
   */
  setupPromiseHandlers(config) {
    this.modalBody.addEventListener("click", (e) => {
      const button = e.target.closest("button[data-modal-action]");
      if (!button) return;

      const action = button.dataset.modalAction;
      let result = null;

      if (action === "confirm") {
        if (config.type === "input") {
          const input = this.modalBody.querySelector("#modal-input");
          result = input ? input.value : null;
        } else {
          result = true;
        }
      }

      if (config.resolver) {
        config.resolver(result);
      }

      this.close();
    });

    // Auto-focus input in input modals
    if (config.type === "input") {
      setTimeout(() => {
        const input = this.modalBody.querySelector("#modal-input");
        if (input) input.focus();
      }, 100);
    }
  }

  /**
   * Utility methods
   */
  getCurrentModal() {
    return this.modalStack.length > 0
      ? this.modalStack[this.modalStack.length - 1]
      : null;
  }

  getModalStackSize() {
    return this.modalStack.length;
  }

  closeAll() {
    this.modalStack = [];
    this.hideModal();
  }
}

// Create singleton instance
const modalManager = new ModalManager();

export default modalManager;
