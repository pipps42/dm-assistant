/**
 * Character Manager - Versione semplice che estende BaseManager
 * Gestisce solo le specificità dei personaggi
 */
import BaseManager from "../core/base-manager.js";
import * as CharacterTemplates from "../templates/character-templates.js";
import ImageUpload from "../ui/image-upload.js";
import modalManager from "../ui/modal-manager.js";

class CharacterManager extends BaseManager {
  constructor() {
    super("characters", CharacterTemplates);
    this.imageUpload = null;
  }

  /**
   * Process form data specifico per i personaggi
   */
  processFormData(data) {
    // Convert strings to numbers
    data.level = parseInt(data.level) || 1;
    data.hitPoints = data.hitPoints ? parseInt(data.hitPoints) : null;

    // Get avatar from image upload
    if (this.imageUpload) {
      data.avatar = this.imageUpload.getValue();
    }

    // Trim strings
    ["name", "playerName", "background"].forEach((field) => {
      if (data[field]) data[field] = data[field].trim();
    });
  }

  /**
   * Setup componenti specifici del form personaggi
   */
  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("character-avatar-upload");
    if (uploadContainer) {
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "avatar",
        allowEmoji: true,
        defaultEmoji: "🧙",
        name: "avatar",
      });

      if (entity?.avatar) {
        this.imageUpload.setValue(entity.avatar);
      }
    }
  }

  /**
   * Gestisce azioni specifiche del detail personaggi
   */
  async handleDetailAction(action, entity, button) {
    switch (action) {
      case "add-adventure":
        await this.addAdventure(entity);
        break;

      case "remove-adventure":
        const adventureId = button.dataset.adventureId;
        await this.removeAdventure(entity, adventureId);
        break;
    }
  }

  /**
   * Aggiungi impresa al personaggio
   */
  async addAdventure(character) {
    const adventure = await modalManager.input({
      title: "Aggiungi Impresa",
      label: "Descrivi l'impresa:",
      placeholder: "Es. Ha sconfitto il drago rosso...",
    });

    if (!adventure?.trim()) return;

    if (!character.adventures) character.adventures = [];

    character.adventures.push({
      id: Date.now(),
      description: adventure.trim(),
      date: new Date().toISOString(),
    });

    await this.update(character.id, character);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(character.id), 100);
  }

  /**
   * Rimuovi impresa dal personaggio
   */
  async removeAdventure(character, adventureId) {
    if (!character.adventures) return;

    // Handle both ID and index for legacy data
    const id = parseInt(adventureId);
    if (!isNaN(id) && id < character.adventures.length) {
      character.adventures.splice(id, 1);
    } else {
      character.adventures = character.adventures.filter(
        (adv) => adv.id != adventureId
      );
    }

    await this.update(character.id, character);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(character.id), 100);
  }

  /**
   * Cleanup quando necessario
   */
  cleanup() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
  }
}

// Singleton
const characterManager = new CharacterManager();
export default characterManager;
