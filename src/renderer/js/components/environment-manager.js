/**
 * Environment Manager - Refactored version following BaseManager pattern
 */
import BaseManager from "../core/base-manager.js";
import dataStore from "../data/data-store.js";
import environmentTemplates from "../templates/environment-templates.js";
import ImageUpload from "../ui/image-upload.js";
import FormHandler from "../ui/form-handler.js";

class EnvironmentManager extends BaseManager {
  constructor() {
    super({
      entityType: "environments",
      dataStore: dataStore,
      templates: environmentTemplates,
      config: {
        title: "Gestione Ambientazioni",
        emptyMessage: "Nessuna ambientazione creata",
        emptySubMessage:
          "Crea la prima ambientazione per organizzare le tue mappe e NPC",
        defaultAvatar: "🏰",
        hasInteractions: false,
        allowImageUpload: true,
      },
    });

    // Environment-specific data
    this.environmentTypes = [
      "Città",
      "Villaggio",
      "Dungeon",
      "Foresta",
      "Montagna",
      "Deserto",
      "Palude",
      "Costa",
      "Isola",
      "Pianura",
      "Caverna",
      "Fortezza",
      "Tempio",
      "Rovine",
      "Torre",
      "Castello",
      "Taverna",
      "Mercato",
      "Porto",
      "Miniera",
    ];

    this.climates = [
      "Temperato",
      "Tropicale",
      "Desertico",
      "Artico",
      "Montano",
      "Umido",
      "Secco",
      "Ventoso",
      "Nebbioso",
      "Magico",
      "Corrotto",
      "Maledetto",
      "Benedetto",
      "Neutrale",
    ];

    // Component references
    this.imageUpload = null;
    this.formHandler = null;
  }

  /**
   * Render environment card using template
   */
  renderCard(environment) {
    return this.templates.generateCard(environment);
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(data) {
    try {
      const { formData, form, options } = data;

      // Get image data from image upload component
      if (this.imageUpload) {
        formData.image = this.imageUpload.getValue();
      }

      // Process form data
      this.processEnvironmentData(formData);

      // Create or update environment
      if (options.mode === "edit" && this.currentEntity) {
        await this.updateEntity(this.currentEntity.id, formData);
      } else {
        await this.createEntity(formData);
      }

      // Close modal
      this.eventBus.emit("modal:close");
    } catch (error) {
      console.error("Error handling environment form:", error);
      throw error;
    }
  }

  /**
   * Handle detail view actions
   */
  async handleDetailAction(data) {
    const { action, entityId } = data;

    switch (action) {
      case "edit":
        await this.editEntity(entityId);
        break;
      case "delete":
        await this.deleteEntity(entityId);
        break;
      case "view-npc":
        // Delegate to NPC manager
        const npcManager = window.app.managers.npcs;
        if (npcManager) {
          await npcManager.viewDetail(data.npcId);
        }
        break;
      case "add-npc":
        // Delegate to NPC manager
        const npcMgr = window.app.managers.npcs;
        if (npcMgr && npcMgr.openAddFormWithEnvironment) {
          npcMgr.openAddFormWithEnvironment(data.environmentId);
        }
        break;
      case "add-map":
        await this.addMap(entityId);
        break;
      case "remove-map":
        await this.removeMap(entityId, data.mapId);
        break;
      case "close":
        this.eventBus.emit("modal:close");
        break;
    }
  }

  /**
   * Setup modal components after rendering
   */
  setupModalComponents(config) {
    if (config.type === "form") {
      this.setupFormComponents(config);
    }
  }

  /**
   * Setup form-specific components
   */
  setupFormComponents(config) {
    // Initialize image upload component
    const uploadContainer = document.getElementById("environment-image-upload");
    if (uploadContainer) {
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "environment",
        allowEmoji: true,
        defaultEmoji: "🏰",
        name: "image",
      });

      // Set existing value if editing
      if (config.mode === "edit" && config.entity?.image) {
        this.imageUpload.setValue(config.entity.image);
      }
    }

    // Initialize form handler
    const form = document.getElementById("environment-form");
    if (form) {
      this.formHandler = new FormHandler(form, {
        entityType: "environments",
        mode: config.mode,
        validateOnSubmit: true,
        showValidationMessages: true,
      });

      // Populate form if editing
      if (config.mode === "edit" && config.entity) {
        this.formHandler.populate(config.entity);
      }
    }
  }

  /**
   * Process environment-specific data
   */
  processEnvironmentData(data) {
    // Parse dangers (comma-separated)
    if (data.dangers && typeof data.dangers === "string") {
      data.dangers = data.dangers
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);
    }

    // Parse resources (newline-separated)
    if (data.resources && typeof data.resources === "string") {
      data.resources = data.resources
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);
    }

    // Ensure maps array exists
    if (!data.maps) {
      data.maps = [];
    }

    // Add timestamps
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    return data;
  }

  /**
   * Override viewDetail to use Environment template
   */
  async viewDetail(id) {
    const environment = this.getEntity(id);
    if (!environment) {
      window.app.showError("Ambientazione non trovata");
      return;
    }

    this.currentEntity = environment;

    this.eventBus.emit("modal:open", {
      type: "detail",
      entityType: "environments",
      entity: environment,
      title: environment.name,
      content: this.templates.generateDetail(environment),
      size: "large",
    });
  }

  /**
   * Override edit to use Environment template
   */
  editEntity(id) {
    const environment = this.getEntity(id);
    if (!environment) return;

    this.eventBus.emit("modal:close"); // Close current modal

    setTimeout(() => {
      this.eventBus.emit("modal:open", {
        type: "form",
        entityType: "environments",
        mode: "edit",
        entity: environment,
        title: "Modifica Ambientazione",
        content: this.templates.generateForm(environment, "edit"),
        size: "large",
      });
    }, 200);
  }

  /**
   * Override openAddForm to use Environment template
   */
  openAddForm() {
    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: "environments",
      mode: "create",
      title: "Aggiungi Ambientazione",
      content: this.templates.generateForm(),
      size: "large",
    });
  }

  /**
   * Add map to environment
   */
  async addMap(environmentId) {
    try {
      const mapName = await this.eventBus.emit("modal:input", {
        title: "Aggiungi Mappa",
        label: "Nome della mappa:",
        placeholder: "Es. Primo piano, Cantina, Esterno...",
      });

      if (!mapName || !mapName.trim()) return;

      const mapDescription = await this.eventBus.emit("modal:input", {
        title: "Descrizione Mappa",
        label: "Descrizione (opzionale):",
        placeholder: "Descrivi la mappa...",
        inputType: "textarea",
      });

      const environment = this.getEntity(environmentId);
      if (!environment) return;

      // Add map to environment
      const newMap = {
        id: this.generateId(),
        name: mapName.trim(),
        description: mapDescription?.trim() || "",
        file: null, // Future: file upload
        gridSize: 30,
        dimensions: { width: 20, height: 20 },
        createdAt: new Date().toISOString(),
      };

      if (!environment.maps) environment.maps = [];
      environment.maps.push(newMap);

      await this.updateEntity(environmentId, environment);
      await this.viewDetail(environmentId); // Refresh detail view

      window.app.showNotification("Mappa aggiunta!", "success");
    } catch (error) {
      console.error("Error adding map:", error);
      window.app.showError("Errore durante l'aggiunta della mappa");
    }
  }

  /**
   * Remove map from environment
   */
  async removeMap(environmentId, mapId) {
    try {
      const environment = this.getEntity(environmentId);
      if (!environment) return;

      const confirmed = await window.app.showConfirmModal(
        "Rimuovi Mappa",
        "Sei sicuro di voler rimuovere questa mappa?"
      );

      if (!confirmed) return;

      // Remove map
      if (environment.maps) {
        environment.maps = environment.maps.filter((map) => map.id !== mapId);
      }

      await this.updateEntity(environmentId, environment);
      await this.viewDetail(environmentId); // Refresh detail view

      window.app.showNotification("Mappa rimossa!", "success");
    } catch (error) {
      console.error("Error removing map:", error);
      window.app.showError("Errore durante la rimozione della mappa");
    }
  }

  /**
   * Get NPCs in environment
   */
  getNPCsInEnvironment(environmentId) {
    const npcs = this.dataStore.get("npcs");
    return npcs.filter((npc) => npc.environmentId == environmentId);
  }

  /**
   * Get environments for selection
   */
  getEnvironmentsForSelection() {
    return this.getEntities().map((env) => ({
      id: env.id,
      name: env.name,
      type: env.type,
      image: env.image,
    }));
  }

  /**
   * Generate environment list for selection
   */
  generateSelectionList() {
    const environments = this.getEntities();
    return environments
      .map((env) => this.templates.generateSelectionOption(env))
      .join("");
  }

  /**
   * Get environment statistics
   */
  getEnvironmentStats() {
    const environments = this.getEntities();
    const stats = this.getStats();

    // Additional environment-specific stats
    const typeCounts = {};
    const climateCounts = {};

    environments.forEach((env) => {
      // Count by type
      typeCounts[env.type] = (typeCounts[env.type] || 0) + 1;

      // Count by climate
      if (env.climate) {
        climateCounts[env.climate] = (climateCounts[env.climate] || 0) + 1;
      }
    });

    return {
      ...stats,
      typeCounts,
      climateCounts,
      totalMaps: environments.reduce(
        (sum, env) => sum + (env.maps ? env.maps.length : 0),
        0
      ),
      totalNPCs: environments.reduce(
        (sum, env) => sum + this.getNPCsInEnvironment(env.id).length,
        0
      ),
    };
  }

  /**
   * Export environment data
   */
  exportEnvironments() {
    const environments = this.getEntities();
    const exportData = {
      environments,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-environments-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Generate unique ID for maps
   */
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup when component is destroyed
   */
  destroy() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }

    if (this.formHandler) {
      this.formHandler.destroy();
      this.formHandler = null;
    }

    // Remove event listeners
    this.eventBus.off("form:submit");
    this.eventBus.off("detail:action");
    this.eventBus.off("modal:rendered");

    super.destroy();
  }
}

// Create and export singleton instance
const environmentManager = new EnvironmentManager();
export default environmentManager;
