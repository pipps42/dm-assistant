/**
 * Base Manager - Versione semplice e funzionale
 * Gestisce CRUD operations e rendering di base
 */
import modalManager from "../ui/modal-manager.js";
import dataStore from "../data/data-store.js";

export default class BaseManager {
  constructor(entityType, templates) {
    this.entityType = entityType;
    this.templates = templates;
    this.dataStore = dataStore;
  }

  // ========== DATA OPERATIONS ==========

  getAll() {
    return this.dataStore.get(this.entityType);
  }

  getById(id) {
    return this.dataStore.findById(this.entityType, String(id));
  }

  async create(data) {
    const entity = await this.dataStore.add(this.entityType, data);
    this.showSuccess(`${this.getDisplayName()} creato!`);
    this.render();
    return entity;
  }

  async update(id, data) {
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
      modalManager.close(); // Chiudi tutte le modali
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

  // ========== MODALS ==========

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
    const entity = this.getById(id);
    if (!entity) return;

    const title = entity.name;
    const content = this.templates.generateDetail(entity);

    modalManager.open({ title, content, size: "large" });
    this.setupDetailHandlers(entity);
  }

  // ========== EVENT HANDLERS ==========

  setupFormHandlers(entity, mode) {
    const form = document.querySelector(
      "#" + this.entityType.slice(0, -1) + "-form"
    );
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Process data if needed
      if (this.processFormData) {
        this.processFormData(data);
      }

      try {
        if (mode === "edit") {
          await this.update(entity.id, data);
        } else {
          await this.create(data);
        }
        modalManager.close();
      } catch (error) {
        this.showError(error.message);
      }
    });

    // Setup any additional form components
    if (this.setupFormComponents) {
      this.setupFormComponents(entity, mode);
    }
  }

  setupDetailHandlers(entity) {
    modalManager.modalBody.addEventListener("click", async (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;

      switch (action) {
        case "edit":
          modalManager.close();
          setTimeout(() => this.openForm(entity), 100);
          break;

        case "delete":
          await this.delete(entity.id);
          break;

        case "close":
          modalManager.close();
          break;

        default:
          // Let subclasses handle custom actions
          if (this.handleDetailAction) {
            this.handleDetailAction(action, entity, button);
          }
      }
    });
  }

  // ========== UTILITIES ==========

  getDisplayName() {
    const names = {
      characters: "Personaggio",
      npcs: "NPC",
      environments: "Ambientazione",
    };
    return names[this.entityType] || "Item";
  }

  getManagerName() {
    const names = {
      characters: "characterManager",
      npcs: "npcManager",
      environments: "environmentManager",
    };
    return names[this.entityType];
  }

  showSuccess(message) {
    window.app?.showNotification(message, "success");
  }

  showError(message) {
    window.app?.showError(message);
  }
}
