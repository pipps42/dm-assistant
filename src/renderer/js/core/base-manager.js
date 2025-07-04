/**
 * Base Manager - Classe base per tutti i manager
 * Fornisce funzionalità comuni e interfaccia standardizzata
 */
import EventBus from "./event-bus.js";
import dataStore from "../data/data-store.js";

export default class BaseManager {
  constructor(options = {}) {
    // Handle both old and new constructor patterns
    if (typeof options === "string") {
      // Old pattern: BaseManager(entityType, config)
      this.entityType = options;
      this.config = arguments[1] || {};
    } else {
      // New pattern: BaseManager({entityType, config, ...})
      this.entityType = options.entityType;
      this.config = options.config || {};
      this.templates = options.templates;
      this.dataStore = options.dataStore;
    }

    // Default config
    this.config = {
      hasImages: false,
      hasInteractions: false,
      defaultAvatar: "🧙",
      ...this.config,
    };

    this.currentEntity = null;
    this.eventBus = EventBus;

    // Subscribe to relevant events
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for this manager
   */
  setupEventListeners() {
    this.eventBus.on(`${this.entityType}:created`, (data) => {
      this.onEntityCreated(data);
    });

    this.eventBus.on(`${this.entityType}:updated`, (data) => {
      this.onEntityUpdated(data);
    });

    this.eventBus.on(`${this.entityType}:deleted`, (data) => {
      this.onEntityDeleted(data);
    });
  }

  /**
   * Get all entities of this type
   */
  getEntities() {
    return dataStore.get(this.entityType);
  }

  /**
   * Get entity by ID
   */
  getEntity(id) {
    return dataStore.findById(this.entityType, id);
  }

  /**
   * Create new entity
   */
  async createEntity(data) {
    try {
      const entity = await dataStore.add(this.entityType, data);
      this.eventBus.emit(`${this.entityType}:created`, entity);
      window.app.showNotification(
        `${this.getEntityDisplayName()} creato con successo!`,
        "success"
      );
      return entity;
    } catch (error) {
      console.error(`Error creating ${this.entityType}:`, error);
      window.app.showError(`Errore durante la creazione: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update existing entity
   */
  async updateEntity(id, data) {
    try {
      const entity = await dataStore.update(this.entityType, id, data);
      this.eventBus.emit(`${this.entityType}:updated`, entity);
      window.app.showNotification(
        `${this.getEntityDisplayName()} aggiornato con successo!`,
        "success"
      );
      return entity;
    } catch (error) {
      console.error(`Error updating ${this.entityType}:`, error);
      window.app.showError(`Errore durante l'aggiornamento: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete entity
   */
  async deleteEntity(id) {
    const entityName = this.getEntityDisplayName();
    const confirmed = await window.app.showConfirmModal(
      `Elimina ${entityName}`,
      `Sei sicuro di voler eliminare questo ${entityName.toLowerCase()}? Questa azione non può essere annullata.`
    );

    if (!confirmed) return false;

    try {
      await dataStore.remove(this.entityType, id);
      this.eventBus.emit(`${this.entityType}:deleted`, { id });
      window.app.showNotification(`${entityName} eliminato`, "success");
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.entityType}:`, error);
      window.app.showError(`Errore durante l'eliminazione: ${error.message}`);
      throw error;
    }
  }

  /**
   * Render main section - to be implemented by subclasses
   */
  async render() {
    const contentBody = document.getElementById("content-body");
    const entities = this.getEntities();

    if (entities.length === 0) {
      contentBody.innerHTML = this.renderEmptyState();
      return;
    }

    const cardsHtml = entities
      .map((entity) => this.renderCard(entity))
      .join("");
    contentBody.innerHTML = `<div class="cards-grid">${cardsHtml}</div>`;

    this.attachCardEventListeners();
  }

  /**
   * Render empty state - can be overridden by subclasses
   */
  renderEmptyState() {
    const entityName = this.getEntityDisplayName();
    return `
            <div class="empty-state">
                <h3>Nessun ${entityName.toLowerCase()} creato</h3>
                <p>Aggiungi il primo ${entityName.toLowerCase()} per iniziare</p>
                <button class="btn btn-primary mt-2" onclick="${this.getManagerName()}.openAddForm()">
                    + Crea primo ${entityName.toLowerCase()}
                </button>
            </div>
        `;
  }

  /**
   * Render card - to be implemented by subclasses
   */
  renderCard(entity) {
    throw new Error("renderCard method must be implemented by subclass");
  }

  /**
   * Attach event listeners to cards
   */
  attachCardEventListeners() {
    const attribute = `data-${this.entityType.slice(0, -1)}-id`;
    document.querySelectorAll(`[${attribute}]`).forEach((card) => {
      card.addEventListener("click", () => {
        const entityId = parseInt(card.getAttribute(attribute));
        this.viewDetail(entityId);
      });
    });
  }

  /**
   * Open add form
   */
  openAddForm() {
    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: this.entityType,
      mode: "create",
      title: `Aggiungi ${this.getEntityDisplayName()}`,
      size: "large",
    });
  }

  /**
   * View entity detail
   */
  async viewDetail(id) {
    const entity = this.getEntity(id);
    if (!entity) {
      window.app.showError(`${this.getEntityDisplayName()} non trovato`);
      return;
    }

    this.currentEntity = entity;

    this.eventBus.emit("modal:open", {
      type: "detail",
      entityType: this.entityType,
      entity: entity,
      title: entity.name || this.getEntityDisplayName(),
      size: "large",
    });
  }

  /**
   * Edit entity
   */
  editEntity(id) {
    const entity = this.getEntity(id);
    if (!entity) return;

    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: this.entityType,
      mode: "edit",
      entity: entity,
    });
  }

  /**
   * Add interaction to entity (if supported)
   */
  async addInteraction(entityId, interaction) {
    if (!this.config.hasInteractions) return;

    try {
      const entity = this.getEntity(entityId);
      if (!entity) return;

      if (!entity.interactions) entity.interactions = [];
      entity.interactions.push({
        id: Date.now(),
        description: interaction.trim(),
        date: new Date().toISOString(),
      });

      await this.updateEntity(entityId, entity);
      await this.viewDetail(entityId); // Refresh detail view
    } catch (error) {
      console.error("Error adding interaction:", error);
      window.app.showError("Errore durante l'aggiunta dell'interazione");
    }
  }

  /**
   * Remove interaction from entity
   */
  async removeInteraction(entityId, interactionId) {
    if (!this.config.hasInteractions) return;

    try {
      const entity = this.getEntity(entityId);
      if (!entity) return;

      if (entity.interactions) {
        entity.interactions = entity.interactions.filter(
          (int) => int.id !== interactionId
        );
      }

      await this.updateEntity(entityId, entity);
      await this.viewDetail(entityId); // Refresh detail view
    } catch (error) {
      console.error("Error removing interaction:", error);
      window.app.showError("Errore durante la rimozione dell'interazione");
    }
  }

  /**
   * Event handlers - can be overridden by subclasses
   */
  onEntityCreated(entity) {
    this.render();
  }

  onEntityUpdated(entity) {
    this.render();
  }

  onEntityDeleted(data) {
    if (this.currentEntity && this.currentEntity.id === data.id) {
      this.currentEntity = null;
    }
    this.render();
  }

  /**
   * Helper methods
   */
  getEntityDisplayName() {
    const names = {
      characters: "Personaggio",
      npcs: "NPC",
      environments: "Ambientazione",
      monsters: "Mostro",
      encounters: "Incontro",
    };
    return names[this.entityType] || "elemento";
  }

  getManagerName() {
    return `${this.entityType.slice(0, -1)}Manager`;
  }

  /**
   * Format avatar for display
   */
  formatAvatar(avatar) {
    if (!avatar) return this.config.defaultAvatar;

    if (avatar.startsWith("data:image")) {
      return `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    return avatar;
  }

  /**
   * Get entity statistics
   */
  getStats() {
    const entities = this.getEntities();
    return {
      total: entities.length,
      recent: entities.filter((e) => {
        const created = new Date(e.createdAt || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length,
    };
  }
}
