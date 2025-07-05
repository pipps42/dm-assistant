/**
 * Character Manager - Versione Ultra-Semplice
 * Zero listener duplicati, funziona sempre
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

    // Ensure adventures array exists
    if (!data.adventures) data.adventures = [];
  }

  /**
   * Setup componenti specifici del form personaggi
   */
  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("character-avatar-upload");
    if (uploadContainer) {
      // Cleanup existing upload component
      if (this.imageUpload) {
        this.imageUpload.destroy();
      }

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
   * Chiamato dal listener globale del BaseManager
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

    // REFRESH SEMPLICE - aggiorna solo il contenuto
    const updatedCharacter = this.getById(character.id);
    if (updatedCharacter) {
      const newContent = this.templates.generateDetail(updatedCharacter);
      modalManager.updateCurrentContent(newContent);
    }
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

    // REFRESH SEMPLICE - aggiorna solo il contenuto
    const updatedCharacter = this.getById(character.id);
    if (updatedCharacter) {
      const newContent = this.templates.generateDetail(updatedCharacter);
      modalManager.updateCurrentContent(newContent);
    }
  }

  /**
   * Get characters for encounter selection
   */
  getCharactersForEncounter() {
    return this.getAll().map((character) => ({
      id: character.id,
      name: character.name,
      type: "character",
      avatar: character.avatar,
      playerName: character.playerName,
      level: character.level,
      class: character.class,
      race: character.race,
      hitPoints: character.hitPoints,
    }));
  }

  /**
   * Generate character list for selection
   */
  generateSelectionList() {
    const characters = this.getAll();
    return characters
      .map((character) => this.templates.generateSelectionOption(character))
      .join("");
  }

  /**
   * Get character statistics
   */
  getCharacterStats() {
    const characters = this.getAll();

    const stats = {
      total: characters.length,
      levelCounts: {},
      classCounts: {},
      raceCounts: {},
      recent: 0,
      totalAdventures: 0,
    };

    characters.forEach((character) => {
      // Count by level
      stats.levelCounts[character.level] =
        (stats.levelCounts[character.level] || 0) + 1;

      // Count by class
      stats.classCounts[character.class] =
        (stats.classCounts[character.class] || 0) + 1;

      // Count by race
      if (character.race) {
        stats.raceCounts[character.race] =
          (stats.raceCounts[character.race] || 0) + 1;
      }

      // Count recent (last week)
      const created = new Date(character.createdAt || 0);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (created > weekAgo) {
        stats.recent++;
      }

      // Count total adventures
      stats.totalAdventures += character.adventures
        ? character.adventures.length
        : 0;
    });

    // Calculate average level
    stats.averageLevel =
      characters.length > 0
        ? characters.reduce((sum, char) => sum + char.level, 0) /
          characters.length
        : 0;

    return stats;
  }

  /**
   * Export character data
   */
  exportCharacters() {
    const characters = this.getAll();
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
    this.showSuccess("Personaggi esportati!");
  }

  /**
   * Search characters by name, class, or race
   */
  searchCharacters(query) {
    const searchTerm = query.toLowerCase();
    return this.getAll().filter(
      (char) =>
        char.name.toLowerCase().includes(searchTerm) ||
        char.class.toLowerCase().includes(searchTerm) ||
        (char.race && char.race.toLowerCase().includes(searchTerm)) ||
        (char.playerName && char.playerName.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get characters by level range
   */
  getCharactersByLevel(minLevel, maxLevel) {
    return this.getAll().filter(
      (char) => char.level >= minLevel && char.level <= maxLevel
    );
  }

  /**
   * Get characters by class
   */
  getCharactersByClass(className) {
    return this.getAll().filter((char) => char.class === className);
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

  /**
   * Destroy manager - cleanup
   */
  destroy() {
    this.cleanup();
    console.log("Character manager destroyed");
  }
}

// Create and export singleton instance
const characterManager = new CharacterManager();
export default characterManager;
