/**
 * NPC Manager - Gestione NPC con architettura refactorizzata
 */
import BaseManager from "../core/base-manager.js";
import EventBus from "../core/event-bus.js";
import * as NPCTemplates from "../templates/npc-templates.js";
import ImageUpload from "../ui/image-upload.js";
import FormHandler from "../ui/form-handler.js";

class NPCManager extends BaseManager {
  constructor() {
    super("npcs", {
      hasImages: true,
      hasInteractions: true,
      defaultAvatar: "🧙",
    });

    this.templates = NPCTemplates;
    this.imageUpload = null;
    this.formHandler = null;

    this.setupNPCSpecificEvents();
  }

  /**
   * Setup NPC-specific event listeners
   */
  setupNPCSpecificEvents() {
    // Listen for form events
    this.eventBus.on("form:submit", (data) => {
      if (
        data.options?.entityType === "npcs" ||
        data.form?.dataset?.entityType === "npcs"
      ) {
        this.handleFormSubmit(data);
      }
    });

    // Listen for detail view actions
    this.eventBus.on("detail:action", (data) => {
      if (data.entityType === "npcs") {
        this.handleDetailAction(data);
      }
    });

    // Listen for modal events to setup components
    this.eventBus.on("modal:rendered", (config) => {
      if (config.entityType === "npcs") {
        this.setupModalComponents(config);
      }
    });
  }
  /**
   * Render NPC card using template
   */
  renderCard(npc) {
    return this.templates.generateCard(npc);
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(data) {
    try {
      const { formData, form, options } = data;

      // Get image data from image upload component
      if (this.imageUpload) {
        formData.avatar = this.imageUpload.getValue();
      }

      // Process form data
      this.processNPCData(formData);

      // Create or update NPC
      if (options.mode === "edit" && this.currentEntity) {
        await this.updateEntity(this.currentEntity.id, formData);
      } else {
        await this.createEntity(formData);
      }

      // Close modal
      this.eventBus.emit("modal:close");
    } catch (error) {
      console.error("Error handling NPC form:", error);
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
      case "add-interaction":
        await this.addInteraction(entityId);
        break;
      case "remove-interaction":
        await this.removeInteraction(entityId, data.interactionId);
        break;
      case "view-npc":
        await this.viewDetail(data.npcId);
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
    const uploadContainer = document.getElementById("npc-avatar-upload");
    if (uploadContainer) {
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "avatar",
        allowEmoji: true,
        defaultEmoji: "🧙",
        name: "avatar",
      });

      // Set existing value if editing
      if (config.mode === "edit" && config.entity?.avatar) {
        this.imageUpload.setValue(config.entity.avatar);
      }
    }

    // Initialize form handler
    const form = document.getElementById("npc-form");
    if (form) {
      this.formHandler = new FormHandler(form, {
        entityType: "npcs",
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
   * Process NPC-specific data
   */
  processNPCData(data) {
    // Parse dangers and resources
    if (data.motivations) {
      data.motivations = data.motivations.trim();
    }

    if (data.secrets) {
      data.secrets = data.secrets.trim();
    }

    // Ensure environmentId is number or null
    if (data.environmentId) {
      data.environmentId = parseInt(data.environmentId);
    } else {
      data.environmentId = null;
    }

    // Add timestamps
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    return data;
  }

  /**
   * Add interaction to NPC
   */
  async addInteraction(npcId) {
    try {
      const interaction = await this.eventBus.emit("modal:input", {
        title: "Aggiungi Interazione",
        label: "Descrivi l'interazione con i giocatori:",
        placeholder: "Es. Ha fornito informazioni sulla taverna locale...",
        inputType: "textarea",
      });

      if (!interaction || !interaction.trim()) return;

      await this.addInteraction(npcId, interaction.trim());
    } catch (error) {
      console.error("Error adding interaction:", error);
      window.app.showError("Errore durante l'aggiunta dell'interazione");
    }
  }

  /**
   * Override viewDetail to use NPC template
   */
  async viewDetail(id) {
    const npc = this.getEntity(id);
    if (!npc) {
      window.app.showError("NPC non trovato");
      return;
    }

    this.currentEntity = npc;

    this.eventBus.emit("modal:open", {
      type: "detail",
      entityType: "npcs",
      entity: npc,
      title: npc.name,
      content: this.templates.generateDetail(npc),
      size: "large",
    });
  }

  /**
   * Override edit to use NPC template
   */
  editEntity(id) {
    const npc = this.getEntity(id);
    if (!npc) return;

    this.eventBus.emit("modal:close"); // Close current modal

    setTimeout(() => {
      this.eventBus.emit("modal:open", {
        type: "form",
        entityType: "npcs",
        mode: "edit",
        entity: npc,
        title: "Modifica NPC",
        content: this.templates.generateForm(npc, "edit"),
        size: "large",
      });
    }, 200);
  }

  /**
   * Override openAddForm to use NPC template
   */
  openAddForm() {
    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: "npcs",
      mode: "create",
      title: "Aggiungi NPC",
      content: this.templates.generateForm(),
      size: "large",
    });
  }

  /**
   * Open add form with pre-selected environment
   */
  openAddFormWithEnvironment(environmentId) {
    const npc = { environmentId };

    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: "npcs",
      mode: "create",
      entity: npc,
      title: "Aggiungi NPC",
      content: this.templates.generateForm(npc),
      size: "large",
    });
  }

  /**
   * Get NPCs for encounter selection
   */
  getNPCsForEncounter() {
    return this.getEntities().map((npc) => ({
      id: npc.id,
      name: npc.name,
      type: "npc",
      avatar: npc.avatar,
      attitude: npc.attitude,
      race: npc.race,
      profession: npc.profession,
      alignment: npc.alignment,
    }));
  }

  /**
   * Get NPCs by environment
   */
  getNPCsByEnvironment(environmentId) {
    return this.getEntities().filter(
      (npc) => npc.environmentId == environmentId
    );
  }

  /**
   * Generate NPC list for selection
   */
  generateSelectionList() {
    const npcs = this.getEntities();
    return npcs
      .map((npc) => this.templates.generateSelectionOption(npc))
      .join("");
  }

  /**
   * Get NPC statistics
   */
  getNPCStats() {
    const npcs = this.getEntities();
    const stats = this.getStats();

    // Additional NPC-specific stats
    const attitudeCounts = {};
    const raceCounts = {};
    const environmentCounts = {};

    npcs.forEach((npc) => {
      // Count by attitude
      attitudeCounts[npc.attitude] = (attitudeCounts[npc.attitude] || 0) + 1;

      // Count by race
      if (npc.race) {
        raceCounts[npc.race] = (raceCounts[npc.race] || 0) + 1;
      }

      // Count by environment
      if (npc.environmentId) {
        environmentCounts[npc.environmentId] =
          (environmentCounts[npc.environmentId] || 0) + 1;
      }
    });

    return {
      ...stats,
      attitudeCounts,
      raceCounts,
      environmentCounts,
      totalInteractions: npcs.reduce(
        (sum, npc) => sum + (npc.interactions ? npc.interactions.length : 0),
        0
      ),
    };
  }

  /**
   * Export NPC data
   */
  exportNPCs() {
    const npcs = this.getEntities();
    const exportData = {
      npcs,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-npcs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * View NPC detail (legacy compatibility)
   */
  async viewNPCDetail(id) {
    return this.viewDetail(id);
  }

  /**
   * Edit NPC (legacy compatibility)
   */
  editNPC(id) {
    return this.editEntity(id);
  }

  /**
   * Delete NPC (legacy compatibility)
   */
  async deleteNPC(id) {
    return this.deleteEntity(id);
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
const npcManager = new NPCManager();
export default npcManager;
