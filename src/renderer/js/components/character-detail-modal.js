/**
 * Character Detail Modal Handler - Gestione modale dettaglio personaggio
 */
import { IDetailHandler } from "./manager-factory.js";
import modalManager from "../ui/modal-manager.js";

export default class CharacterDetailModal extends IDetailHandler {
  constructor(manager) {
    super(manager);
  }

  /**
   * Gestisce azioni specifiche del detail personaggi
   */
  async handleDetailAction(action, entity, button) {
    if (!entity) {
      console.warn("No entity provided for action:", action);
      return;
    }

    switch (action) {
      case "add-adventure":
        await this.addAdventure(entity);
        break;

      case "remove-adventure":
        const adventureId = button.dataset.itemId;
        await this.removeAdventure(entity, adventureId);
        break;

      case "level-up":
        await this.levelUp(entity);
        break;

      case "update-hp":
        await this.updateHP(entity);
        break;

      case "add-note":
        await this.addNote(entity);
        break;

      case "remove-note":
        const noteId = button.dataset.itemId;
        await this.removeNote(entity, noteId);
        break;

      case "export-sheet":
        await this.exportCharacterSheet(entity);
        break;

      default:
        console.log(`Unhandled character action: ${action}`);
    }
  }

  /**
   * Aggiungi impresa al personaggio
   */
  async addAdventure(character) {
    const adventure = await modalManager.input({
      title: "Aggiungi Impresa",
      label: "Descrivi l'impresa:",
      placeholder: "Es. Ha sconfitto il drago rosso nelle Montagne del Nord...",
    });

    if (!adventure?.trim()) return;

    if (!character.adventures) character.adventures = [];

    const newAdventure = {
      id: Date.now(),
      description: adventure.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "adventure",
    };

    character.adventures.push(newAdventure);

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess("Impresa aggiunta!");
  }

  /**
   * Rimuovi impresa dal personaggio
   */
  async removeAdventure(character, adventureId) {
    if (!character.adventures || !adventureId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Impresa",
      message: "Sei sicuro di voler rimuovere questa impresa?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(adventureId);

    // First try ID-based removal (for object adventures)
    const initialLength = character.adventures.length;
    character.adventures = character.adventures.filter((adv) => {
      // Handle object adventures with ID
      if (typeof adv === "object" && adv.id) {
        return adv.id != adventureId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      character.adventures.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < character.adventures.length
    ) {
      character.adventures.splice(id, 1);
    }

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess("Impresa rimossa!");
  }

  /**
   * Avanza di livello
   */
  async levelUp(character) {
    if (character.level >= 20) {
      this.manager.showError(
        "Il personaggio ha già raggiunto il livello massimo!"
      );
      return;
    }

    const confirmed = await modalManager.confirm({
      title: "Avanza Livello",
      message: `Aumentare il livello di ${character.name} da ${
        character.level
      } a ${character.level + 1}?`,
      confirmText: "Avanza",
    });

    if (!confirmed) return;

    const oldLevel = character.level;
    character.level++;

    // Add level-up adventure entry
    if (!character.adventures) character.adventures = [];
    character.adventures.push({
      id: Date.now(),
      description: `Avanzato al livello ${character.level}`,
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
      type: "level-up",
    });

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess(
      `${character.name} è avanzato al livello ${character.level}!`
    );
  }

  /**
   * Aggiorna HP massimi
   */
  async updateHP(character) {
    const newHP = await modalManager.input({
      title: "Aggiorna HP",
      label: "Nuovi HP massimi:",
      inputType: "number",
      placeholder: character.hitPoints?.toString() || "",
    });

    if (!newHP || isNaN(newHP) || newHP <= 0) return;

    const oldHP = character.hitPoints;
    character.hitPoints = parseInt(newHP);

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess(
      `HP aggiornati da ${oldHP || "N/A"} a ${character.hitPoints}`
    );
  }

  /**
   * Aggiungi nota al personaggio
   */
  async addNote(character) {
    const noteText = await modalManager.input({
      title: "Aggiungi Nota",
      label: "Testo della nota:",
      placeholder:
        "Es. Ha un particolare legame con il PNG Marco, teme i ragni...",
    });

    if (!noteText?.trim()) return;

    if (!character.notes) character.notes = [];

    const newNote = {
      id: Date.now(),
      text: noteText.trim(),
      date: new Date().toISOString(),
      session: this.getCurrentSessionNumber(),
    };

    character.notes.push(newNote);

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess("Nota aggiunta!");
  }

  /**
   * Rimuovi nota dal personaggio
   */
  async removeNote(character, noteId) {
    if (!character.notes || !noteId) return;

    const confirmed = await modalManager.confirm({
      title: "Rimuovi Nota",
      message: "Sei sicuro di voler rimuovere questa nota?",
    });

    if (!confirmed) return;

    // Convert to number for index-based removal
    const id = parseInt(noteId);

    // First try ID-based removal (for object notes)
    const initialLength = character.notes.length;
    character.notes = character.notes.filter((note) => {
      // Handle object notes with ID
      if (typeof note === "object" && note.id) {
        return note.id != noteId;
      }
      return true;
    });

    // If no removal happened and we have a valid index, try index-based removal
    if (
      character.notes.length === initialLength &&
      !isNaN(id) &&
      id >= 0 &&
      id < character.notes.length
    ) {
      character.notes.splice(id, 1);
    }

    await this.manager.update(character.id, character);
    this.refreshDetail(character.id);
    this.manager.showSuccess("Nota rimossa!");
  }

  /**
   * Esporta scheda personaggio
   */
  async exportCharacterSheet(character) {
    try {
      const sheetData = {
        name: character.name,
        playerName: character.playerName,
        race: character.race,
        class: character.class,
        level: character.level,
        alignment: character.alignment,
        hitPoints: character.hitPoints,
        background: character.background,
        adventures: character.adventures || [],
        notes: character.notes || [],
        exportDate: new Date().toISOString(),
        exportedBy: "D&D Assistant",
      };

      const dataStr = JSON.stringify(sheetData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${character.name.replace(/\s+/g, "_")}_scheda.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.manager.showSuccess("Scheda esportata!");
    } catch (error) {
      console.error("Export error:", error);
      this.manager.showError("Errore durante l'esportazione");
    }
  }

  /**
   * Ottieni numero sessione corrente (placeholder)
   */
  getCurrentSessionNumber() {
    // TODO: Implementare sistema di tracking sessioni
    return new Date().toLocaleDateString("it-IT");
  }
}
