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
  // QUI CREDO MANCHI ANCORA QUALCOSA...
}
