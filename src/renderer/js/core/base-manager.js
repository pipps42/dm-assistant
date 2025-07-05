/**
 * Enhanced Base Manager - Versione modulare con supporto per factory pattern
 * Gestisce CRUD operations e rendering di base con architettura modulare
 */
import modalManager from "../ui/modal-manager.js";
import dataStore from "../data/data-store.js";

export default class BaseManager {
  constructor(entityType, templates, options = {}) {
    this.entityType = entityType;
    this.templates = templates;
    this.dataStore = dataStore;
    this.options = {
      hasDetailView: false, // false = modal, true = dedicated view
      hasUtils: true,
      hasFormComponents: true,
      ...options,
    };

    // Modular components
    this.detailHandler = null;
    this.utils = null;
    this.formHandler = null;

    // Setup global listener only once
    if (!window.globalDetailListener) {
      this.setupGlobalDetailListener();
      window.globalDetailListener = true;
    }
  }

  /**
   * Initialize modular components
   */
  initializeComponents() {
    // Override in subclasses to initialize utils, detailHandler, etc.
  }

  setupGlobalDetailListener() {
    document.addEventListener("click", async (e) => {
      if (!e.target.closest("#modal") && !e.target.closest(".detail-view"))
        return;

      const button = e.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const entityId = button.dataset.id;
      const entityType = button.dataset.entityType || this.entityType;

      // Find the correct manager
      const managerName = this.getManagerName(entityType);
      const manager = window[managerName];

      if (!manager) return;

      await this.handleGlobalAction(action, entityId, manager, button);
    });
  }

  async handleGlobalAction(action, entityId, manager, button) {
    switch (action) {
      case "edit":
        const entity = manager.getById(entityId);
        manager.openForm(entity);
        break;
      case "delete":
        await manager.delete(entityId);
        break;
      case "close":
        if (manager.options.hasDetailView) {
          manager.detailHandler?.goBack();
        } else {
          modalManager.close();
        }
        break;
      default:
        // Delegate to specific detail handler
        if (manager.detailHandler?.handleDetailAction) {
          const entity = manager.getById(entityId);
          await manager.detailHandler.handleDetailAction(
            action,
            entity,
            button
          );
        }
    }
  }

  // ========== DATA OPERATIONS ==========

  getAll() {
    return this.dataStore.get(this.entityType);
  }

  getById(id) {
    return this.dataStore.findById(this.entityType, String(id));
  }

  async create(data) {
    // Validate before creation
    if (this.utils?.validateEntity) {
      const errors = this.utils.validateEntity(data);
      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    }

    const entity = await this.dataStore.add(this.entityType, data);
    this.showSuccess(`${this.getDisplayName()} creato!`);
    this.render();
    return entity;
  }

  async update(id, data) {
    // Validate before update
    if (this.utils?.validateEntity) {
      const errors = this.utils.validateEntity({ ...data, id });
      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    }

    const entity = await this.dataStore.update(this.entityType, id, data);
    this.showSuccess(`${this.getDisplayName()} aggiornato!`);
    this.render();
    return entity;
  }

  async delete(id) {
    const entity = this.getById(id);
    if (!entity) return false;

    const confirmed = await modalManager.confirm({
      title: `Elimina ${this.getDisplayName()}`,
      message: `Eliminare "${entity.name}"? Questa azione non può essere annullata.`,
      confirmText: "Elimina",
    });

    if (confirmed) {
      await this.dataStore.remove(this.entityType, id);
      this.showSuccess(`${this.getDisplayName()} eliminato`);
      modalManager.closeAll();
      this.render();
      return true;
    }

    return false;
  }

  // ========== RENDERING ==========

  async render() {
    const contentBody = document.getElementById("content-body");
    const entities = this.getAll();

    if (entities.length === 0) {
      contentBody.innerHTML = this.renderEmpty();
      return;
    }

    const cards = entities
      .map((entity) => this.templates.generateCard(entity))
      .join("");
    contentBody.innerHTML = `<div class="cards-grid">${cards}</div>`;

    this.attachEvents();
  }

  renderEmpty() {
    return `
      <div class="empty-state">
        <h3>Nessun ${this.getDisplayName().toLowerCase()} presente</h3>
        <p>Crea il primo ${this.getDisplayName().toLowerCase()} per iniziare</p>
        <button class="btn btn-primary" onclick="window.${this.getManagerName()}.openForm()">
          + Crea ${this.getDisplayName()}
        </button>
      </div>
    `;
  }

  attachEvents() {
    const selector = `[data-${this.entityType.slice(0, -1)}-id]`;

    document.querySelectorAll(selector).forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;

        const id = card.getAttribute(`data-${this.entityType.slice(0, -1)}-id`);
        this.openDetail(id);
      });
    });
  }

  // ========== MODALS & DETAILS ==========

  openForm(entity = null) {
    const mode = entity ? "edit" : "create";
    const title = entity
      ? `Modifica ${this.getDisplayName()}`
      : `Nuovo ${this.getDisplayName()}`;
    const content = this.templates.generateForm(entity, mode);

    modalManager.open({ title, content, size: "large" });
    this.setupFormHandlers(entity, mode);
  }

  openDetail(id) {
    if (this.options.hasDetailView && this.detailHandler?.viewDetail) {
      // Dedicated detail view (like environments)
      this.detailHandler.viewDetail(id);
    } else {
      // Modal detail view (like characters/npcs)
      const entity = this.getById(id);
      if (!entity) return;

      modalManager.open({
        title: entity.name,
        content: this.templates.generateDetail(entity),
        size: "large",
      });
    }
  }

  // ========== FORM HANDLING ==========

  setupFormHandlers(entity, mode) {
    const form = document.querySelector(
      "#" + this.entityType.slice(0, -1) + "-form"
    );
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Process form data if handler exists
      if (this.processFormData) {
        this.processFormData(data);
      }

      try {
        if (mode === "edit") {
          await this.update(entity.id, data);

          // Update underlying detail if in modal stack
          if (modalManager.modalStack.length >= 2) {
            const updatedEntity = this.getById(entity.id);
            if (updatedEntity) {
              const newDetailContent =
                this.templates.generateDetail(updatedEntity);
              const detailModal =
                modalManager.modalStack[modalManager.modalStack.length - 2];
              detailModal.content = newDetailContent;
              detailModal.title = updatedEntity.name;
            }
          }
        } else {
          await this.create(data);
        }
        modalManager.close();
      } catch (error) {
        this.showError(error.message);
      }
    });

    // Handle cancel button
    const cancelBtn = form.querySelector('button[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        modalManager.close();
      });
    }

    // Setup form components (image upload, etc.)
    if (this.setupFormComponents) {
      this.setupFormComponents(entity, mode);
    }
  }

  // ========== SEARCH & FILTER ==========

  search(query) {
    if (this.utils?.searchEntities) {
      return this.utils.searchEntities(query);
    }

    // Default search implementation
    const searchTerm = query.toLowerCase();
    return this.getAll().filter((entity) =>
      entity.name.toLowerCase().includes(searchTerm)
    );
  }

  filter(criteria) {
    if (this.utils?.filterEntities) {
      return this.utils.filterEntities(criteria);
    }

    // Default filter implementation
    return this.getAll().filter((entity) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (typeof value === "function") {
          return value(entity[key]);
        }
        return entity[key] === value;
      });
    });
  }

  // ========== STATISTICS ==========

  getStats() {
    if (this.utils?.getEntityStats) {
      return this.utils.getEntityStats();
    }

    // Basic stats
    const entities = this.getAll();
    return {
      total: entities.length,
      recent: entities.filter((entity) => {
        const created = new Date(entity.createdAt || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length,
    };
  }

  // ========== EXPORT/IMPORT ==========

  export() {
    if (this.utils?.exportEntities) {
      return this.utils.exportEntities();
    }

    // Default export
    const entities = this.getAll();
    const exportData = {
      [this.entityType]: entities,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-${this.entityType}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showSuccess(`${this.getDisplayName()} esportati!`);
  }

  // ========== UTILITIES ==========

  getDisplayName() {
    const names = {
      characters: "Personaggio",
      npcs: "NPC",
      environments: "Ambientazione",
      monsters: "Mostro",
      encounters: "Incontro",
    };
    return names[this.entityType] || "Entità";
  }

  getManagerName(entityType = null) {
    const type = entityType || this.entityType;
    const names = {
      characters: "characterManager",
      npcs: "npcManager",
      environments: "environmentManager",
      monsters: "monsterManager",
      encounters: "encounterManager",
    };
    return names[type];
  }

  showSuccess(message) {
    window.app?.showNotification(message, "success");
  }

  showError(message) {
    window.app?.showError(message);
  }

  // ========== CLEANUP ==========

  cleanup() {
    // Override in subclasses
  }

  destroy() {
    this.cleanup();
    if (this.detailHandler?.destroy) {
      this.detailHandler.destroy();
    }
    if (this.utils?.destroy) {
      this.utils.destroy();
    }
    console.log(`${this.getDisplayName()} manager destroyed`);
  }
}
