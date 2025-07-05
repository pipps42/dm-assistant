/**
 * Manager Factory - Pattern per creare manager uniformemente
 * Centralizza la creazione e configurazione dei manager
 */
import modalManager from "../ui/modal-manager.js";

// Base interfaces for standardization
export class IDetailHandler {
  constructor(manager) {
    this.manager = manager;
  }

  handleDetailAction(action, entity, button) {
    throw new Error("handleDetailAction must be implemented");
  }

  refreshDetail(entityId) {
    const entity = this.manager.getById(entityId);
    if (!entity) return;

    const newContent = this.manager.templates.generateDetail(entity);
    modalManager.updateCurrentContent(newContent);
  }

  destroy() {
    // Optional cleanup
  }
}

export class IEntityUtils {
  constructor(manager) {
    this.manager = manager;
  }

  getEntityStats() {
    throw new Error("getEntityStats must be implemented");
  }

  searchEntities(query) {
    throw new Error("searchEntities must be implemented");
  }

  validateEntity(data) {
    throw new Error("validateEntity must be implemented");
  }

  exportEntities() {
    throw new Error("exportEntities must be implemented");
  }

  destroy() {
    // Optional cleanup
  }
}

export class IFormHandler {
  constructor(manager) {
    this.manager = manager;
  }

  processFormData(data) {
    throw new Error("processFormData must be implemented");
  }

  setupFormComponents(entity, mode) {
    throw new Error("setupFormComponents must be implemented");
  }

  destroy() {
    // Optional cleanup
  }
}

/**
 * Manager Factory Class
 */
export class ManagerFactory {
  static managerRegistry = new Map();
  static componentRegistry = new Map();

  /**
   * Register a manager configuration
   */
  static register(entityType, config) {
    this.managerRegistry.set(entityType, {
      ManagerClass: config.ManagerClass,
      templates: config.templates,
      options: config.options || {},
      components: config.components || {},
    });
  }

  /**
   * Create a manager instance
   */
  static create(entityType) {
    const config = this.managerRegistry.get(entityType);
    if (!config) {
      throw new Error(`Manager for ${entityType} not registered`);
    }

    const manager = new config.ManagerClass();

    // Initialize modular components
    this.initializeComponents(manager, config.components);

    return manager;
  }

  /**
   * Initialize modular components for a manager
   */
  static initializeComponents(manager, components) {
    // Initialize utils if provided
    if (components.UtilsClass) {
      manager.utils = new components.UtilsClass(manager);
    }

    // Initialize detail handler if provided
    if (components.DetailHandlerClass) {
      manager.detailHandler = new components.DetailHandlerClass(manager);
    }

    // Initialize form handler if provided
    if (components.FormHandlerClass) {
      manager.formHandler = new components.FormHandlerClass(manager);
    }

    // Call manager's initialization method
    if (manager.initializeComponents) {
      manager.initializeComponents();
    }
  }

  /**
   * Create all registered managers
   */
  static createAll() {
    const managers = {};

    for (const [entityType] of this.managerRegistry.entries()) {
      const managerName = this.getManagerVariableName(entityType);
      managers[managerName] = this.create(entityType);
    }

    return managers;
  }

  /**
   * Get manager variable name from entity type
   */
  static getManagerVariableName(entityType) {
    return entityType.slice(0, -1) + "Manager";
  }

  /**
   * Register component types for reuse
   */
  static registerComponent(name, ComponentClass) {
    this.componentRegistry.set(name, ComponentClass);
  }

  /**
   * Get registered component
   */
  static getComponent(name) {
    return this.componentRegistry.get(name);
  }

  /**
   * Validate manager interface compliance
   */
  static validateManager(manager) {
    const requiredMethods = [
      "getAll",
      "getById",
      "create",
      "update",
      "delete",
      "render",
      "openForm",
      "openDetail",
      "search",
    ];

    const missing = requiredMethods.filter(
      (method) => typeof manager[method] !== "function"
    );

    if (missing.length > 0) {
      throw new Error(
        `Manager missing required methods: ${missing.join(", ")}`
      );
    }

    return true;
  }

  /**
   * Create manager with validation
   */
  static createValidated(entityType) {
    const manager = this.create(entityType);
    this.validateManager(manager);
    return manager;
  }
}

/**
 * Configuration Builder for easier manager setup
 */
export class ManagerConfigBuilder {
  constructor(entityType) {
    this.entityType = entityType;
    this.config = {
      ManagerClass: null,
      templates: null,
      options: {},
      components: {},
    };
  }

  setManagerClass(ManagerClass) {
    this.config.ManagerClass = ManagerClass;
    return this;
  }

  setTemplates(templates) {
    this.config.templates = templates;
    return this;
  }

  setOptions(options) {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  addUtilsClass(UtilsClass) {
    this.config.components.UtilsClass = UtilsClass;
    return this;
  }

  addDetailHandler(DetailHandlerClass) {
    this.config.components.DetailHandlerClass = DetailHandlerClass;
    return this;
  }

  addFormHandler(FormHandlerClass) {
    this.config.components.FormHandlerClass = FormHandlerClass;
    return this;
  }

  build() {
    if (!this.config.ManagerClass || !this.config.templates) {
      throw new Error("ManagerClass and templates are required");
    }

    ManagerFactory.register(this.entityType, this.config);
    return this;
  }

  create() {
    return ManagerFactory.create(this.entityType);
  }
}

/**
 * Standard Manager Components Library
 */
export class StandardComponents {
  /**
   * Base Modal Detail Handler for entities that use modals
   */
  static BaseModalDetailHandler = class extends IDetailHandler {
    async handleDetailAction(action, entity, button) {
      // Override in subclasses for specific actions
      console.log(`Unhandled action: ${action} for entity:`, entity?.id);
    }

    refreshDetail(entityId) {
      const entity = this.manager.getById(entityId);
      if (!entity) return;

      const newContent = this.manager.templates.generateDetail(entity);
      modalManager.updateCurrentContent(newContent);
    }
  };

  /**
   * Base Entity Utils with common functionality
   */
  static BaseEntityUtils = class extends IEntityUtils {
    getEntityStats() {
      const entities = this.manager.getAll();
      return {
        total: entities.length,
        recent: entities.filter((entity) => {
          const created = new Date(entity.createdAt || 0);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return created > weekAgo;
        }).length,
      };
    }

    searchEntities(query) {
      const searchTerm = query.toLowerCase();
      return this.manager
        .getAll()
        .filter(
          (entity) =>
            entity.name.toLowerCase().includes(searchTerm) ||
            (entity.description &&
              entity.description.toLowerCase().includes(searchTerm))
        );
    }

    validateEntity(data) {
      const errors = [];

      if (!data.name || data.name.trim().length < 2) {
        errors.push("Nome deve essere almeno 2 caratteri");
      }

      if (data.name && data.name.length > 100) {
        errors.push("Nome non può superare 100 caratteri");
      }

      return errors;
    }

    exportEntities() {
      const entities = this.manager.getAll();
      const exportData = {
        [this.manager.entityType]: entities,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dnd-${this.manager.entityType}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.manager.showSuccess(`${this.manager.getDisplayName()} esportati!`);
    }
  };

  /**
   * Base Form Handler with common functionality
   */
  static BaseFormHandler = class extends IFormHandler {
    processFormData(data) {
      // Trim string fields
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string") {
          data[key] = data[key].trim();
        }
      });
    }

    setupFormComponents(entity, mode) {
      // Override in subclasses for specific form components
    }
  };
}

/**
 * Utility function to create a complete manager setup
 */
export function createManagerSetup(
  entityType,
  {
    ManagerClass,
    templates,
    UtilsClass = null,
    DetailHandlerClass = null,
    FormHandlerClass = null,
    options = {},
  }
) {
  return new ManagerConfigBuilder(entityType)
    .setManagerClass(ManagerClass)
    .setTemplates(templates)
    .setOptions(options)
    .addUtilsClass(UtilsClass)
    .addDetailHandler(DetailHandlerClass)
    .addFormHandler(FormHandlerClass)
    .build();
}

export default ManagerFactory;
