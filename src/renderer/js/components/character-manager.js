/**
 * Character Manager
 */
import BaseManager from "../core/base-manager.js";
import EventBus from "../core/event-bus.js";
import * as CharacterTemplates from "../templates/character-templates.js";
import ImageUpload from "../ui/image-upload.js";
import FormHandler from "../ui/form-handler.js";

class CharacterManager extends BaseManager {
  constructor() {
    super("characters", {
      hasImages: true,
      hasInteractions: true,
      defaultAvatar: "🧙",
    });

    this.templates = CharacterTemplates;
    this.imageUpload = null;
    this.formHandler = null;

    this.setupCharacterSpecificEvents();
  }

  /**
   * Setup character-specific event listeners
   */
  setupCharacterSpecificEvents() {
    // Listen for form events
    this.eventBus.on("form:submit", (data) => {
      if (data.options.entityType === "characters") {
        this.handleFormSubmit(data);
      }
    });

    // Listen for detail view actions
    this.eventBus.on("detail:action", (data) => {
      if (data.entityType === "characters") {
        this.handleDetailAction(data);
      }
    });

    // Listen for modal events to setup components
    this.eventBus.on("modal:rendered", (config) => {
      if (config.entityType === "characters") {
        this.setupModalComponents(config);
      }
    });
  }

  /**
   * Render character card using template
   */
  renderCard(character) {
    return this.templates.generateCard(character);
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
      this.processCharacterData(formData);

      // Create or update character
      if (options.mode === "edit" && this.currentEntity) {
        await this.updateEntity(this.currentEntity.id, formData);
      } else {
        await this.createEntity(formData);
      }

      // Close modal
      this.eventBus.emit("modal:close");
    } catch (error) {
      console.error("Error handling character form:", error);
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
      case "add-adventure":
        await this.addAdventure(entityId);
        break;
      case "remove-adventure":
        await this.removeAdventure(entityId, data.adventureId);
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
    const uploadContainer = document.getElementById("character-avatar-upload");
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
    const form = document.getElementById("character-form");
    if (form) {
      this.formHandler = new FormHandler(form, {
        entityType: "characters",
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
   * Process character-specific data
   */
  processCharacterData(data) {
    // Ensure level is a number
    if (data.level) {
      data.level = parseInt(data.level);
    }

    // Ensure hitPoints is a number or null
    if (data.hitPoints) {
      data.hitPoints = parseInt(data.hitPoints);
    } else {
      data.hitPoints = null;
    }

    // Trim text fields
    if (data.background) {
      data.background = data.background.trim();
    }

    // Add timestamps
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    return data;
  }

  /**
   * Add adventure/achievement to character
   */
  async addAdventure(characterId) {
    try {
      const adventure = await this.eventBus.emit("modal:input", {
        title: "Aggiungi Impresa",
        label: "Descrivi l'impresa o momento significativo:",
        placeholder: "Es. Ha sconfitto il drago rosso Smaug...",
        inputType: "textarea",
      });

      if (!adventure || !adventure.trim()) return;

      await this.addInteraction(characterId, adventure.trim());
    } catch (error) {
      console.error("Error adding adventure:", error);
      window.app.showError("Errore durante l'aggiunta dell'impresa");
    }
  }

  /**
   * Remove adventure from character
   */
  async removeAdventure(characterId, adventureId) {
    await this.removeInteraction(characterId, adventureId);
  }

  /**
   * Override viewDetail to use character template
   */
  async viewDetail(id) {
    const character = this.getEntity(id);
    if (!character) {
      window.app.showError("Personaggio non trovato");
      return;
    }

    this.currentEntity = character;

    this.eventBus.emit("modal:open", {
      type: "detail",
      entityType: "characters",
      entity: character,
      title: character.name,
      content: this.templates.generateDetail(character),
      size: "large",
    });
  }

  /**
   * Override edit to use character template
   */
  editEntity(id) {
    const character = this.getEntity(id);
    if (!character) return;

    this.eventBus.emit("modal:close"); // Close current modal

    setTimeout(() => {
      this.eventBus.emit("modal:open", {
        type: "form",
        entityType: "characters",
        mode: "edit",
        entity: character,
        title: "Modifica Personaggio",
        content: this.templates.generateForm(character, "edit"),
        size: "large",
      });
    }, 200);
  }

  /**
   * Override openAddForm to use character template
   */
  openAddForm() {
    this.eventBus.emit("modal:open", {
      type: "form",
      entityType: "characters",
      mode: "create",
      title: "Aggiungi Personaggio",
      content: this.templates.generateForm(),
      size: "large",
    });
  }

  /**
   * Get characters for encounter selection
   */
  getCharactersForEncounter() {
    return this.getEntities().map((character) => ({
      id: character.id,
      name: character.name,
      type: "character",
      avatar: character.avatar,
      maxHP: character.hitPoints || 45,
      currentHP: character.hitPoints || 45,
      initiative: 0,
      class: character.class,
      level: character.level,
      playerName: character.playerName,
    }));
  }

  /**
   * Generate character list for selection
   */
  generateSelectionList() {
    const characters = this.getEntities();
    return characters
      .map((char) => this.templates.generateSelectionOption(char))
      .join("");
  }

  /**
   * Get character statistics
   */
  getCharacterStats() {
    const characters = this.getEntities();
    const stats = this.getStats();

    // Additional character-specific stats
    const classCounts = {};
    const levelDistribution = { low: 0, mid: 0, high: 0 };

    characters.forEach((char) => {
      // Count by class
      classCounts[char.class] = (classCounts[char.class] || 0) + 1;

      // Level distribution
      if (char.level <= 5) levelDistribution.low++;
      else if (char.level <= 10) levelDistribution.mid++;
      else levelDistribution.high++;
    });

    return {
      ...stats,
      classCounts,
      levelDistribution,
      averageLevel:
        characters.length > 0
          ? Math.round(
              characters.reduce((sum, char) => sum + char.level, 0) /
                characters.length
            )
          : 0,
    };
  }

  /**
   * Export character data
   */
  exportCharacters() {
    const characters = this.getEntities();
    const exportData = {
      characters,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-characters-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
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
const characterManager = new CharacterManager();
export default characterManager;
