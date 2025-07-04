// src/renderer/js/components/character-manager.js
import BaseManager from "../core/base-manager.js";
import EventBus from "../core/event-bus.js";
import * as CharacterTemplates from "../templates/character-templates.js";
import ImageUpload from "../ui/image-upload.js";
import FormHandler from "../ui/form-handler.js";
import modalManager from "../ui/modal-manager.js";

class CharacterManager extends BaseManager {
  constructor() {
    super("characters", {
      hasImages: true,
      hasInteractions: true,
      defaultAvatar: "🧙",
    });

    this.templates = CharacterTemplates;
    this.imageUpload = null; //ImageUpload.getInstance();
    this.formHandler = null;
    this.eventBus = EventBus;

    this.setupCharacterSpecificEvents();
  }

  renderCard(entity) {
    // Usa il template già presente
    return this.templates.generateCard(entity);
  }

  /**
   * Setup character-specific event listeners
   */
  setupCharacterSpecificEvents() {
    // Listen for form events
    this.eventBus.on("form:submit", (data) => {
      if (
        data.options?.entityType === "characters" ||
        data.form?.dataset?.entityType === "characters" ||
        data.config?.entityType === "characters"
      ) {
        this.handleFormSubmit(data);
      }
    });

    // Listen for detail view actions
    this.eventBus.on("detail:action", (data) => {
      if (data.entityType === "characters") {
        this.handleDetailAction(data);
      }
    });
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(data) {
    try {
      const { formData, form, options, config } = data;

      if (!formData) {
        throw new Error("Form data is missing");
      }

      // Get image data from image upload component
      if (this.imageUpload) {
        formData.avatar = this.imageUpload.getValue();
      } else {
        formData.avatar = formData.avatar || "🧙";
      }

      // Process form data
      this.processCharacterData(formData);

      // Create or update character
      if ((options?.mode || config?.mode) === "edit" && this.currentEntity) {
        await this.updateEntity(this.currentEntity.id, formData);
      } else {
        await this.createEntity(formData);
      }

      // Close modal and clear current entity
      this.currentEntity = null;
      modalManager.close();
    } catch (error) {
      console.error("Error handling character form:", error);
      window.app.showError(`Errore nel salvataggio: ${error.message}`);
    }
  }

  handleDetailAction(data) {
    const { action, entityId } = data;
    switch (action) {
      case "add-adventure":
        this.addAdventure(entityId);
        break;
      case "edit":
        this.editEntity(entityId);
        break;
      case "delete":
        this.deleteEntity(entityId);
        break;
      case "close":
        modalManager.close();
        break;
      // aggiungi altri casi se servono
      default:
        console.warn("Azione non gestita:", action, data);
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
    ["name", "playerName", "background"].forEach((field) => {
      if (data[field]) {
        data[field] = data[field].trim();
      }
    });

    return data;
  }

  /**
   * Add adventure to character
   */
  async addAdventure(characterId) {
    try {
      const adventure = await modalManager.showInput({
        title: "Aggiungi Impresa",
        label: "Descrivi l'impresa o momento significativo:",
        placeholder: "Es. Ha sconfitto il drago rosso Smaug...",
        inputType: "textarea",
      });

      if (!adventure || !adventure.trim()) return;

      const character = this.getEntity(characterId);
      if (!character) return;

      // Ensure adventures array exists
      if (!character.adventures) {
        character.adventures = [];
      }

      // Add new adventure
      character.adventures.push({
        id: Date.now(),
        description: adventure.trim(),
        date: new Date().toISOString(),
      });

      await this.updateEntity(characterId, character);
      await this.viewDetail(characterId); // Refresh detail view

      window.app.showNotification("Impresa aggiunta!", "success");
    } catch (error) {
      console.error("Error adding adventure:", error);
      window.app.showError("Errore durante l'aggiunta dell'impresa");
    }
  }

  /**
   * Remove adventure from character
   */
  async removeAdventure(characterId, adventureId) {
    try {
      const character = this.getEntity(characterId);
      if (!character || !character.adventures) return;

      // Convert adventureId to number if it's an index
      const numAdventureId = parseInt(adventureId);

      if (
        !isNaN(numAdventureId) &&
        numAdventureId < character.adventures.length
      ) {
        // Remove by index for legacy data
        character.adventures.splice(numAdventureId, 1);
      } else {
        // Remove by ID
        character.adventures = character.adventures.filter(
          (adv) => adv.id != adventureId
        );
      }

      await this.updateEntity(characterId, character);
      await this.viewDetail(characterId); // Refresh detail view

      window.app.showNotification("Impresa rimossa", "success");
    } catch (error) {
      console.error("Error removing adventure:", error);
      window.app.showError("Errore durante la rimozione dell'impresa");
    }
  }

  /**
   * Override edit to use character template
   */
  async editEntity(id) {
    const character = this.getEntity(id);
    if (!character) {
      window.app.showError("Personaggio non trovato");
      return;
    }

    this.currentEntity = character;
    modalManager.close(); // Chiudi eventuale modale aperta

    await modalManager.showForm({
      entityType: "characters",
      mode: "edit",
      entity: character,
      title: "Modifica Personaggio",
      content: this.templates.generateForm(character, "edit"),
      size: "large",
    });
  }

  /**
   * Destroy handler - cleanup
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

    super.destroy();
  }
}

// Create and export singleton instance
const characterManager = new CharacterManager();
export default characterManager;
